const express = require('express')
const app = express()
const moment = require('moment')

const HTTP_PORT = process.env.PORT || 8080

app.use((req, res, next) => {
    const timestamp = moment().format('HH:mm:ss')
    console.log(`> [${timestamp}] Request for resource: ${req.originalUrl}`)
    next()
})

app.use(express.urlencoded({ extended: true }))

// dummy data for Books
let bookList = [
    {
        title: "1984",
        author: "George Orwell",
        price: 13.99,
        availability: true,
        isCheckedByCurrUser: false
    },
    {
        title: "Animal Farm",
        author: "George Orwell",
        price: 13.99,
        availability: true,
        isCheckedByCurrUser: false
    },
    {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        price: 14.99,
        availability: false,
        isCheckedByCurrUser: false
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        price: 14.99,
        availability: false,
        isCheckedByCurrUser: false
    },
    {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        price: 15.99,
        availability: true,
        isCheckedByCurrUser: false
    },
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: 15.99,
        availability: false,
        isCheckedByCurrUser: false
    },
    {
        title: "The Handmaid’s Tale",
        author: "Margaret Atwood",
        price: 19.99,
        availability: false,
        isCheckedByCurrUser: false
    },
    {
        title: "The Elements of Style",
        author: "William Strunk Jr.",
        price: 19.99,
        availability: true,
        isCheckedByCurrUser: false
    }
]

// hbs config
const exphbs = require('express-handlebars')

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    helpers: {
        json: (context) => { return JSON.stringify(context) }
    }
}))

app.set('view engine', 'hbs')

app.use(express.static('public'))

// Home Page
app.get('/', (req, res) => {
    res.render('home', { title: "Central Public Library | Home" })
})

// Books Page
app.get('/books', (req, res) => {

    const queryList = req.query
    const lenQueryList = Object.entries(queryList).length
    const filter = queryList.filterBy

    // enter using filter function
    if (lenQueryList && filter === 'all-books' ||
        !lenQueryList) {
        res.render('books', {
            title: "Central Public Library | Books",
            books: bookList,
            filter: "all-books"
        })
        return
    }
    else if (lenQueryList) {
        if (filter === 'available-books') {
            let filteredList = []
            bookList.forEach(book => {
                if (book.availability) {
                    filteredList.push(book)
                }
            })
            if (!filteredList.length) {
                res.render('error', {
                    title: "Central Public Library | Error",
                    errHeader: "No Available Books",
                    errorMsg: "Please come back later."
                })
                return
            }
            res.render('books', {
                title: "Central Public Library | Books",
                books: filteredList,
                filter: "available-books"
            })
            return
        }
        else if (filter === 'my-books') {
            let filteredList = []
            bookList.forEach(book => {
                if (book.isCheckedByCurrUser) {
                    filteredList.push(book)
                }
            })
            if (!filteredList.length) {
                res.render('error', {
                    title: "Central Public Library | Error",
                    errHeader: "No Books Found",
                    errMsg: "You have no borrowed books."
                })
                return
            }
            res.render('books', {
                title: "Central Public Library | Books",
                books: filteredList,
                filter: "my-books"
            })
            return
        }
    }
    // incorrect filter (e.g. manually type url param)
    res.render('error', {
        title: "Central Public Library | Error",
        errHeader: "Invalid Filter",
        errMsg: "Please select an available filter."
    })
})

// Search function with error handling
app.get('/books/search', (req, res) => {
    const text = req.query.searchText

    if (!text) {
        res.render('error', {
            title: "Central Public Library | Error",
            errHeader: "Form Error",
            errMsg: "No search keyword provided."
        })
        return
    }

    let searchedList = []
    bookList.forEach(book => {
        if (book.title.toLowerCase().includes(text.toLowerCase())) {
            searchedList.push(book)
        }
    })

    if (!searchedList.length) {
        res.render('error', {
            title: "Central Public Library | Error",
            errHeader: "Search Error",
            errMsg: "No matched search result."
        })
        return
    }
    res.render('books', { title: "Central Public Library | Books", books: searchedList })
})

// Borrow book 
app.post('/books', (req, res) => {
    const bookId = req.body.bookId

    // error handling for not ticking checkbox
    if (!req.body.checkbox) {
        res.render('error', {
            title: "Central Public Library | Error",
            errHeader: "Reservation Error",
            errMsg: "You must tick the checkbox before clicking 'Borrow'."
        })
        return
    }

    bookList[bookId].availability = false
    bookList[bookId].isCheckedByCurrUser = true
    res.render('books', {
        title: "Central Public Library | Books",
        books: bookList,
        filter: "all-books"
    })
})

app.use((req, res) => {
    res.render('error', {
        title: "Central Public Library | Error",
        errHeader: "404 Page Not Found",
        errMsg: "This appears to be an invalid URL."
    })
})

const onHttpStart = () => {
    console.log(`> Web server started on port ${HTTP_PORT}. Press Ctrl+C to exit.`)
}

app.listen(HTTP_PORT, onHttpStart)