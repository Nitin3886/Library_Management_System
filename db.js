// Database simulation using localStorage

const db = {
    // Initialize database with default data if it doesn't exist
    init: function() {
        if (!localStorage.getItem('db_initialized')) {
            console.log('Initializing database...');
            
            // Default admin user
            const adminUser = {
                id: 1,
                username: 'admin',
                password: 'admin123', // In a real app, this would be hashed
                name: 'System Administrator',
                email: 'admin@library.com',
                role: 'admin',
                status: 'active',
                phone: '123-456-7890',
                address: 'Library Main Building',
                joinDate: '2023-01-01',
                profileImage: '../assets/admin-avatar.png'
            };
            
            // Default librarian user
            const librarianUser = {
                id: 2,
                username: 'librarian',
                password: 'library123', // In a real app, this would be hashed
                name: 'Main Librarian',
                email: 'librarian@library.com',
                role: 'librarian',
                status: 'active',
                phone: '123-456-7891',
                designation: 'Senior Librarian',
                joinDate: '2023-01-02',
                profileImage: '../assets/librarian-avatar.png'
            };
            
            // Default standard user
            const standardUser = {
                id: 3,
                username: 'user',
                password: 'user123', // In a real app, this would be hashed
                name: 'John Reader',
                email: 'user@example.com',
                role: 'user',
                status: 'active',
                phone: '123-456-7892',
                address: '123 Reader St, Booktown',
                borrowedBooks: [],
                joinDate: '2023-01-03',
                profileImage: '../assets/user-avatar.png'
            };
            
            // Sample books
            const books = [
                {
                    id: 1,
                    title: 'To Kill a Mockingbird',
                    author: 'Harper Lee',
                    isbn: '9780061120084',
                    category: 'fiction',
                    publisher: 'HarperCollins',
                    publicationYear: 1960,
                    language: 'English',
                    pages: 336,
                    description: 'To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.',
                    coverImage: '../assets/books/mockingbird.jpg',
                    copies: [
                        { copyId: 101, status: 'available', location: 'Shelf A-1' },
                        { copyId: 102, status: 'available', location: 'Shelf A-1' },
                        { copyId: 103, status: 'borrowed', location: 'Shelf A-1', borrowedBy: 3, dueDate: '2023-12-15' }
                    ]
                },
                {
                    id: 2,
                    title: '1984',
                    author: 'George Orwell',
                    isbn: '9780451524935',
                    category: 'fiction',
                    publisher: 'Signet Classics',
                    publicationYear: 1949,
                    language: 'English',
                    pages: 328,
                    description: '1984 is a dystopian novel by English novelist George Orwell. It was published in June 1949 by Secker & Warburg as Orwell\'s ninth and final book completed in his lifetime.',
                    coverImage: '../assets/books/1984.jpg',
                    copies: [
                        { copyId: 201, status: 'available', location: 'Shelf B-2' },
                        { copyId: 202, status: 'available', location: 'Shelf B-2' }
                    ]
                },
                {
                    id: 3,
                    title: 'The Great Gatsby',
                    author: 'F. Scott Fitzgerald',
                    isbn: '9780743273565',
                    category: 'fiction',
                    publisher: 'Scribner',
                    publicationYear: 1925,
                    language: 'English',
                    pages: 180,
                    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
                    coverImage: '../assets/books/gatsby.jpg',
                    copies: [
                        { copyId: 301, status: 'available', location: 'Shelf C-3' },
                        { copyId: 302, status: 'borrowed', location: 'Shelf C-3', borrowedBy: 3, dueDate: '2023-12-10' }
                    ]
                },
                {
                    id: 4,
                    title: 'The Hobbit',
                    author: 'J.R.R. Tolkien',
                    isbn: '9780547928227',
                    category: 'fiction',
                    publisher: 'Houghton Mifflin Harcourt',
                    publicationYear: 1937,
                    language: 'English',
                    pages: 304,
                    description: 'The Hobbit, or There and Back Again is a children\'s fantasy novel by English author J. R. R. Tolkien. It was published on 21 September 1937 to wide critical acclaim, being nominated for the Carnegie Medal and awarded a prize from the New York Herald Tribune for best juvenile fiction.',
                    coverImage: '../assets/books/hobbit.jpg',
                    copies: [
                        { copyId: 401, status: 'available', location: 'Shelf D-4' },
                        { copyId: 402, status: 'available', location: 'Shelf D-4' }
                    ]
                },
                {
                    id: 5,
                    title: 'Pride and Prejudice',
                    author: 'Jane Austen',
                    isbn: '9780141439518',
                    category: 'fiction',
                    publisher: 'Penguin Classics',
                    publicationYear: 1813,
                    language: 'English',
                    pages: 480,
                    description: 'Pride and Prejudice is an 1813 romantic novel of manners written by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist of the book, who learns about the repercussions of hasty judgments and eventually comes to appreciate the difference between superficial goodness and actual goodness.',
                    coverImage: '../assets/books/pride.jpg',
                    copies: [
                        { copyId: 501, status: 'available', location: 'Shelf E-5' }
                    ]
                }
            ];
            
            // Sample transactions
            const transactions = [
                {
                    id: 1,
                    userId: 3,
                    bookId: 1,
                    copyId: 103,
                    type: 'borrow',
                    issueDate: '2023-11-15',
                    dueDate: '2023-12-15',
                    returnDate: null,
                    status: 'active',
                    issuedBy: 2
                },
                {
                    id: 2,
                    userId: 3,
                    bookId: 3,
                    copyId: 302,
                    type: 'borrow',
                    issueDate: '2023-11-10',
                    dueDate: '2023-12-10',
                    returnDate: null,
                    status: 'active',
                    issuedBy: 2
                }
            ];
            
            // Store data in localStorage
            localStorage.setItem('users', JSON.stringify([adminUser, librarianUser, standardUser]));
            localStorage.setItem('books', JSON.stringify(books));
            localStorage.setItem('transactions', JSON.stringify(transactions));
            localStorage.setItem('db_initialized', 'true');
            
            console.log('Database initialized with sample data');
        }
    },
    
    // User-related functions
    users: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('users') || '[]');
        },
        
        getById: function(id) {
            const users = this.getAll();
            return users.find(user => user.id === parseInt(id));
        },
        
        getByUsername: function(username) {
            const users = this.getAll();
            return users.find(user => user.username === username);
        },
        
        add: function(user) {
            const users = this.getAll();
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            
            const newUser = {
                id: newId,
                ...user,
                joinDate: new Date().toISOString().split('T')[0],
                borrowedBooks: []
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            return newUser;
        },
        
        update: function(id, userData) {
            const users = this.getAll();
            const index = users.findIndex(user => user.id === parseInt(id));
            
            if (index !== -1) {
                users[index] = { ...users[index], ...userData };
                localStorage.setItem('users', JSON.stringify(users));
                return users[index];
            }
            
            return null;
        },
        
        delete: function(id) {
            const users = this.getAll();
            const filteredUsers = users.filter(user => user.id !== parseInt(id));
            
            if (filteredUsers.length < users.length) {
                localStorage.setItem('users', JSON.stringify(filteredUsers));
                return true;
            }
            
            return false;
        },
        
        authenticate: function(username, password) {
            const user = this.getByUsername(username);
            
            if (user && user.password === password) {
                return {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role
                };
            }
            
            return null;
        }
    },
    
    // Book-related functions
    books: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('books') || '[]');
        },
        
        getById: function(id) {
            const books = this.getAll();
            return books.find(book => book.id === parseInt(id));
        },
        
        search: function(query, filters = {}) {
            let books = this.getAll();
            
            // Apply search query
            if (query) {
                const searchTerm = query.toLowerCase();
                books = books.filter(book => 
                    book.title.toLowerCase().includes(searchTerm) || 
                    book.author.toLowerCase().includes(searchTerm) || 
                    book.isbn.includes(searchTerm)
                );
            }
            
            // Apply category filter
            if (filters.category) {
                books = books.filter(book => book.category === filters.category);
            }
            
            // Apply availability filter
            if (filters.availability) {
                books = books.filter(book => {
                    if (filters.availability === 'available') {
                        return book.copies.some(copy => copy.status === 'available');
                    } else {
                        return !book.copies.some(copy => copy.status === 'available');
                    }
                });
            }
            
            // Apply sorting
            if (filters.sortBy) {
                switch(filters.sortBy) {
                    case 'title':
                        books.sort((a, b) => a.title.localeCompare(b.title));
                        break;
                    case 'author':
                        books.sort((a, b) => a.author.localeCompare(b.author));
                        break;
                    case 'year':
                        books.sort((a, b) => a.publicationYear - b.publicationYear);
                        break;
                    // default is relevance, no sorting needed
                }
            }
            
            return books;
        },
        
        add: function(book) {
            const books = this.getAll();
            const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
            
            // Generate copy IDs
            const copies = [];
            const numCopies = parseInt(book.copies) || 1;
            const baseId = newId * 100 + 1;
            
            for (let i = 0; i < numCopies; i++) {
                copies.push({
                    copyId: baseId + i,
                    status: 'available',
                    location: book.location || 'General Collection'
                });
            }
            
            const newBook = {
                id: newId,
                ...book,
                copies: copies
            };
            
            books.push(newBook);
            localStorage.setItem('books', JSON.stringify(books));
            return newBook;
        },
        
        update: function(id, bookData) {
            const books = this.getAll();
            const index = books.findIndex(book => book.id === parseInt(id));
            
            if (index !== -1) {
                // Keep existing copies unless explicitly provided
                if (!bookData.copies) {
                    bookData.copies = books[index].copies;
                }
                
                books[index] = { ...books[index], ...bookData };
                localStorage.setItem('books', JSON.stringify(books));
                return books[index];
            }
            
            return null;
        },
        
        delete: function(id) {
            const books = this.getAll();
            const filteredBooks = books.filter(book => book.id !== parseInt(id));
            
            if (filteredBooks.length < books.length) {
                localStorage.setItem('books', JSON.stringify(filteredBooks));
                return true;
            }
            
            return false;
        },
        
        updateCopyStatus: function(bookId, copyId, status, userData = {}) {
            const books = this.getAll();
            const bookIndex = books.findIndex(book => book.id === parseInt(bookId));
            
            if (bookIndex !== -1) {
                const copyIndex = books[bookIndex].copies.findIndex(copy => copy.copyId === parseInt(copyId));
                
                if (copyIndex !== -1) {
                    books[bookIndex].copies[copyIndex].status = status;
                    
                    // Add additional data for borrowed books
                    if (status === 'borrowed' && userData.borrowedBy) {
                        books[bookIndex].copies[copyIndex].borrowedBy = userData.borrowedBy;
                        books[bookIndex].copies[copyIndex].dueDate = userData.dueDate;
                    }
                    
                    // Clear borrower data when returned
                    if (status === 'available') {
                        delete books[bookIndex].copies[copyIndex].borrowedBy;
                        delete books[bookIndex].copies[copyIndex].dueDate;
                    }
                    
                    localStorage.setItem('books', JSON.stringify(books));
                    return true;
                }
            }
            
            return false;
        }
    },
    
    // Transaction-related functions
    transactions: {
        getAll: function() {
            return JSON.parse(localStorage.getItem('transactions') || '[]');
        },
        
        getById: function(id) {
            const transactions = this.getAll();
            return transactions.find(transaction => transaction.id === parseInt(id));
        },
        
        getByUser: function(userId) {
            const transactions = this.getAll();
            return transactions.filter(transaction => transaction.userId === parseInt(userId));
        },
        
        add: function(transaction) {
            const transactions = this.getAll();
            const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
            
            const newTransaction = {
                id: newId,
                ...transaction,
                status: 'active'
            };
            
            transactions.push(newTransaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return newTransaction;
        },
        
        update: function(id, transactionData) {
            const transactions = this.getAll();
            const index = transactions.findIndex(transaction => transaction.id === parseInt(id));
            
            if (index !== -1) {
                transactions[index] = { ...transactions[index], ...transactionData };
                localStorage.setItem('transactions', JSON.stringify(transactions));
                return transactions[index];
            }
            
            return null;
        },
        
        returnBook: function(id, returnDate) {
            const transactions = this.getAll();
            const index = transactions.findIndex(transaction => transaction.id === parseInt(id));
            
            if (index !== -1 && transactions[index].type === 'borrow' && !transactions[index].returnDate) {
                transactions[index].returnDate = returnDate || new Date().toISOString().split('T')[0];
                transactions[index].status = 'returned';
                
                localStorage.setItem('transactions', JSON.stringify(transactions));
                return transactions[index];
            }
            
            return null;
        }
    }
};

// Initialize database on page load
document.addEventListener('DOMContentLoaded', function() {
    db.init();
});
