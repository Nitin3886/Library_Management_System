// Main script for Library Management System

// Global variables
let currentUser = null;

// Check if user is logged in
function checkLogin() {
    const userData = sessionStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        
        // Redirect to appropriate dashboard if on login page
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
            redirectToDashboard();
        }
        
        // Update UI with user info
        updateUserInfo();
        return true;
    } else if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        // Redirect to login page if not logged in
        window.location.href = '../index.html';
        return false;
    }
    return false;
}

// Redirect to appropriate dashboard based on user role
function redirectToDashboard() {
    if (currentUser.role === 'librarian' || currentUser.role === 'admin') {
        window.location.href = 'librarian/dashboard.html';
    } else {
        window.location.href = 'user/dashboard.html';
    }
}

// Update UI with user info
function updateUserInfo() {
    const userNameElements = document.querySelectorAll('#userName, #librarianName');
    const welcomeNameElements = document.querySelectorAll('#welcomeUserName, #welcomeLibrarianName');
    const avatarElements = document.querySelectorAll('#userAvatar, #librarianAvatar, #profileImage');
    
    userNameElements.forEach(el => {
        if (el) el.textContent = currentUser.name;
    });
    
    welcomeNameElements.forEach(el => {
        if (el) el.textContent = currentUser.name;
    });
    
    if (currentUser.profileImage) {
        avatarElements.forEach(el => {
            if (el) el.src = currentUser.profileImage;
        });
    }
}

// Event listeners for login page
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.register-form').style.display = 'block';
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.register-form').style.display = 'none';
            document.querySelector('.login-form').style.display = 'block';
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const userType = document.getElementById('userType').value;
            
            const authUser = db.users.authenticate(username, password);
            
            if (authUser) {
                if (userType === 'librarian' && (authUser.role === 'user')) {
                    showMessage('You do not have librarian access.', 'error');
                    return;
                }
                
                // Save user session
                sessionStorage.setItem('currentUser', JSON.stringify(authUser));
                currentUser = authUser;
                
                // Redirect to dashboard
                redirectToDashboard();
            } else {
                showMessage('Invalid username or password.', 'error');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('regName').value;
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Check if passwords match
            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error');
                return;
            }
            
            // Check if username already exists
            if (db.users.getByUsername(username)) {
                showMessage('Username already exists.', 'error');
                return;
            }
            
            // Create new user
            const newUser = db.users.add({
                username,
                password,
                name,
                email,
                role: 'user',
                status: 'active',
                profileImage: '../assets/user-avatar.png'
            });
            
            if (newUser) {
                showMessage('Registration successful! You can now login.', 'success');
                document.querySelector('.register-form').style.display = 'none';
                document.querySelector('.login-form').style.display = 'block';
                
                // Clear the form
                registerForm.reset();
            } else {
                showMessage('Registration failed. Please try again.', 'error');
            }
        });
    }
}

// Setup user dashboard functionality
function setupUserDashboard() {
    updateBorrowedStats();
    loadRecentBooks();
    loadPopularBooks();
}

// Update borrowed stats on user dashboard
function updateBorrowedStats() {
    const borrowedCount = document.getElementById('borrowedCount');
    const overdueCount = document.getElementById('overdueCount');
    const finesDue = document.getElementById('finesDue');
    
    if (!borrowedCount || !overdueCount || !finesDue) return;
    
    const userTransactions = db.transactions.getByUser(currentUser.id)
        .filter(t => t.type === 'borrow' && t.status === 'active');
    
    const today = new Date();
    let overdue = 0;
    let totalFines = 0;
    
    userTransactions.forEach(transaction => {
        const dueDate = new Date(transaction.dueDate);
        if (dueDate < today) {
            overdue++;
            
            // Calculate fine ($0.50 per day overdue)
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            totalFines += daysOverdue * 0.5;
        }
    });
    
    borrowedCount.textContent = userTransactions.length;
    overdueCount.textContent = overdue;
    finesDue.textContent = '$' + totalFines.toFixed(2);
}

// Load recent books for user dashboard
function loadRecentBooks() {
    const recentBooksContainer = document.getElementById('recentBooks');
    if (!recentBooksContainer) return;
    
    const books = db.books.getAll()
        .sort((a, b) => b.id - a.id) // Sort by newest first (using id as proxy)
        .slice(0, 4); // Get only the 4 most recent books
    
    recentBooksContainer.innerHTML = '';
    
    books.forEach(book => {
        const isAvailable = book.copies.some(copy => copy.status === 'available');
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.coverImage || '../assets/book-placeholder.jpg'}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-status ${isAvailable ? 'available' : 'borrowed'}">${isAvailable ? 'Available' : 'Unavailable'}</p>
            </div>
        `;
        
        bookCard.addEventListener('click', () => {
            window.location.href = `book-details.html?id=${book.id}`;
        });
        
        recentBooksContainer.appendChild(bookCard);
    });
}

// Load popular books for user dashboard
function loadPopularBooks() {
    const popularBooksContainer = document.getElementById('popularBooks');
    if (!popularBooksContainer) return;
    
    // In a real app, this would be based on actual borrow count
    // Here we're just using a random selection
    const books = db.books.getAll()
        .sort(() => 0.5 - Math.random()) // Shuffle array
        .slice(0, 4); // Get 4 random books
    
    popularBooksContainer.innerHTML = '';
    
    books.forEach(book => {
        const isAvailable = book.copies.some(copy => copy.status === 'available');
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.coverImage || '../assets/book-placeholder.jpg'}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-status ${isAvailable ? 'available' : 'borrowed'}">${isAvailable ? 'Available' : 'Unavailable'}</p>
            </div>
        `;
        
        bookCard.addEventListener('click', () => {
            window.location.href = `book-details.html?id=${book.id}`;
        });
        
        popularBooksContainer.appendChild(bookCard);
    });
}

// Setup search functionality
function setupSearch() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const query = document.getElementById('searchQuery').value;
        const category = document.getElementById('category')?.value || '';
        const availability = document.getElementById('availability')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'relevance';
        
        const searchResults = db.books.search(query, { category, availability, sortBy });
        displaySearchResults(searchResults);
    });
}

// Display search results
function displaySearchResults(books) {
    const resultsContainer = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');
    
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    if (resultCount) resultCount.textContent = `(${books.length})`;
    
    if (books.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No books found matching your search criteria.</p>';
        return;
    }
    
    books.forEach(book => {
        const isAvailable = book.copies.some(copy => copy.status === 'available');
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.coverImage || '../assets/book-placeholder.jpg'}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-status ${isAvailable ? 'available' : 'borrowed'}">${isAvailable ? 'Available' : 'Unavailable'}</p>
            </div>
        `;
        
        bookCard.addEventListener('click', () => {
            window.location.href = `book-details.html?id=${book.id}`;
        });
        
        resultsContainer.appendChild(bookCard);
    });
}

// Setup book details page
function setupBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        window.location.href = 'search.html';
        return;
    }
    
    const book = db.books.getById(parseInt(bookId));
    if (!book) {
        window.location.href = 'search.html';
        return;
    }
    
    // Update page title and breadcrumb
    document.title = `${book.title} - Library Management System`;
    const bookTitleElement = document.getElementById('bookTitle');
    if (bookTitleElement) {
        bookTitleElement.textContent = book.title;
    }
    
    // Update book details
    document.getElementById('detailBookTitle').textContent = book.title;
    document.getElementById('bookAuthor').textContent = book.author;
    document.getElementById('bookCover').src = book.coverImage || '../assets/book-placeholder.jpg';
    document.getElementById('bookISBN').textContent = book.isbn;
    document.getElementById('bookPublisher').textContent = book.publisher || 'Unknown';
    document.getElementById('bookYear').textContent = book.publicationYear || 'Unknown';
    document.getElementById('bookCategory').textContent = book.category || 'General';
    document.getElementById('bookPages').textContent = book.pages || 'Unknown';
    document.getElementById('bookLanguage').textContent = book.language || 'English';
    document.getElementById('bookDescription').textContent = book.description || 'No description available.';
    
    // Update availability status
    const isAvailable = book.copies.some(copy => copy.status === 'available');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('bookStatus');
    
    statusIndicator.className = `status-indicator ${isAvailable ? 'available' : 'unavailable'}`;
    statusText.textContent = isAvailable ? 'Available' : 'Currently Unavailable';
    
    // Populate copies table
    const copiesTableBody = document.getElementById('copiesTableBody');
    copiesTableBody.innerHTML = '';
    
    book.copies.forEach(copy => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${copy.copyId}</td>
            <td>${copy.status.charAt(0).toUpperCase() + copy.status.slice(1)}</td>
            <td>${copy.location}</td>
            <td>${copy.dueDate || '-'}</td>
        `;
        copiesTableBody.appendChild(row);
    });
    
    // Setup action buttons
    const borrowBtn = document.getElementById('borrowBtn');
    const reserveBtn = document.getElementById('reserveBtn');
    
    if (borrowBtn) {
        if (isAvailable) {
            borrowBtn.disabled = false;
            borrowBtn.addEventListener('click', () => {
                borrowBook(book);
            });
        } else {
            borrowBtn.disabled = true;
        }
    }
    
    if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
            reserveBook(book);
        });
    }
    
    // Load similar books
    loadSimilarBooks(book);
}

// Borrow a book
function borrowBook(book) {
    // Find first available copy
    const availableCopy = book.copies.find(copy => copy.status === 'available');
    
    if (!availableCopy) {
        showMessage('This book is no longer available.', 'error');
        return;
    }
    
    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    // Create transaction
    const transaction = db.transactions.add({
        userId: currentUser.id,
        bookId: book.id,
        copyId: availableCopy.copyId,
        type: 'borrow',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: dueDateStr,
        returnDate: null,
        issuedBy: 2 // Default librarian (in a real app, this would be the logged-in librarian)
    });
    
    // Update book copy status
    if (transaction) {
        db.books.updateCopyStatus(book.id, availableCopy.copyId, 'borrowed', {
            borrowedBy: currentUser.id,
            dueDate: dueDateStr
        });
        
        showMessage('Book borrowed successfully! Due date: ' + dueDateStr, 'success');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } else {
        showMessage('Failed to borrow book. Please try again.', 'error');
    }
}

// Reserve a book
function reserveBook(book) {
    showMessage('Book reservation functionality coming soon!', 'info');
}

// Load similar books based on category
function loadSimilarBooks(currentBook) {
    const similarBooksContainer = document.getElementById('similarBooks');
    if (!similarBooksContainer) return;
    
    const books = db.books.getAll()
        .filter(book => book.category === currentBook.category && book.id !== currentBook.id)
        .slice(0, 4); // Get max 4 books
    
    similarBooksContainer.innerHTML = '';
    
    if (books.length === 0) {
        similarBooksContainer.innerHTML = '<p class="no-results">No similar books found.</p>';
        return;
    }
    
    books.forEach(book => {
        const isAvailable = book.copies.some(copy => copy.status === 'available');
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.coverImage || '../assets/book-placeholder.jpg'}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <p class="book-status ${isAvailable ? 'available' : 'borrowed'}">${isAvailable ? 'Available' : 'Unavailable'}</p>
            </div>
        `;
        
        bookCard.addEventListener('click', () => {
            window.location.href = `book-details.html?id=${book.id}`;
        });
        
        similarBooksContainer.appendChild(bookCard);
    });
}

// Setup librarian dashboard functionality
function setupLibrarianDashboard() {
    updateLibrarianStats();
    loadRecentTransactions();
    loadBookRequests();
}

// Update librarian dashboard statistics
function updateLibrarianStats() {
    const totalBooksElement = document.getElementById('totalBooks');
    const totalBorrowedElement = document.getElementById('totalBorrowed');
    const totalUsersElement = document.getElementById('totalUsers');
    const totalOverdueElement = document.getElementById('totalOverdue');
    
    if (!totalBooksElement || !totalBorrowedElement || !totalUsersElement || !totalOverdueElement) return;
    
    const books = db.books.getAll();
    const users = db.users.getAll().filter(user => user.role === 'user');
    const transactions = db.transactions.getAll().filter(t => t.type === 'borrow' && t.status === 'active');
    
    // Count total books and copies
    let totalCopies = 0;
    books.forEach(book => {
        totalCopies += book.copies.length;
    });
    
    // Count borrowed books
    let borrowedCopies = 0;
    books.forEach(book => {
        borrowedCopies += book.copies.filter(copy => copy.status === 'borrowed').length;
    });
    
    // Count overdue books
    const today = new Date();
    let overdueCopies = 0;
    books.forEach(book => {
        book.copies.forEach(copy => {
            if (copy.status === 'borrowed' && copy.dueDate) {
                const dueDate = new Date(copy.dueDate);
                if (dueDate < today) {
                    overdueCopies++;
                }
            }
        });
    });
    
    totalBooksElement.textContent = totalCopies;
    totalBorrowedElement.textContent = borrowedCopies;
    totalUsersElement.textContent = users.length;
    totalOverdueElement.textContent = overdueCopies;
}

// Load recent transactions for librarian dashboard
function loadRecentTransactions() {
    const transactionsBody = document.getElementById('recentTransactionsBody');
    if (!transactionsBody) return;
    
    const transactions = db.transactions.getAll()
        .sort((a, b) => b.id - a.id) // Sort by newest first
        .slice(0, 5); // Get only 5 most recent
    
    transactionsBody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const user = db.users.getById(transaction.userId);
        const book = db.books.getById(transaction.bookId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${user ? user.name : 'Unknown'}</td>
            <td>${book ? book.title : 'Unknown'}</td>
            <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
            <td>${transaction.issueDate}</td>
            <td class="${transaction.status === 'active' ? 'text-info' : 'text-success'}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</td>
        `;
        
        transactionsBody.appendChild(row);
    });
}

// Load book requests for librarian dashboard
function loadBookRequests() {
    const requestsBody = document.getElementById('bookRequestsBody');
    if (!requestsBody) return;
    
    // In a real app, this would load actual book requests
    // Here we're just showing sample data
    const sampleRequests = [
        { id: 1, userId: 3, bookId: 4, requestDate: '2023-11-20' },
        { id: 2, userId: 3, bookId: 5, requestDate: '2023-11-18' }
    ];
    
    requestsBody.innerHTML = '';
    
    sampleRequests.forEach(request => {
        const user = db.users.getById(request.userId);
        const book = db.books.getById(request.bookId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${user ? user.name : 'Unknown'}</td>
            <td>${book ? book.title : 'Unknown'}</td>
            <td>${request.requestDate}</td>
            <td>
                <button class="btn btn-primary action-btn approve-btn" data-id="${request.id}">Approve</button>
                <button class="btn btn-danger action-btn reject-btn" data-id="${request.id}">Reject</button>
            </td>
        `;
        
        requestsBody.appendChild(row);
    });
    
    // Add event listeners for request actions
    const approveButtons = document.querySelectorAll('.approve-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');
    
    approveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-id');
            showMessage(`Request #${requestId} approved!`, 'success');
            this.closest('tr').remove();
        });
    });
    
    rejectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-id');
            showMessage(`Request #${requestId} rejected.`, 'info');
            this.closest('tr').remove();
        });
    });
}

// Setup profile page functionality
function setupProfilePage() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const imageUpload = document.getElementById('imageUpload');
    
    // Get current user details from database (more complete than session data)
    const userData = db.users.getById(currentUser.id);
    
    if (!userData) return;
    
    // Fill profile form with user data
    if (profileForm) {
        document.getElementById('fullName').value = userData.name || '';
        document.getElementById('username').value = userData.username || '';
        document.getElementById('email').value = userData.email || '';
        
        // Additional fields that may exist
        if (document.getElementById('phone')) {
            document.getElementById('phone').value = userData.phone || '';
        }
        
        if (document.getElementById('address')) {
            document.getElementById('address').value = userData.address || '';
        }
        
        if (document.getElementById('designation')) {
            document.getElementById('designation').value = userData.designation || '';
        }
        
        if (document.getElementById('joinDate')) {
            document.getElementById('joinDate').value = userData.joinDate || '';
        }
        
        // Handle profile form submission
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updatedUser = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value
            };
            
            // Include additional fields if they exist
            if (document.getElementById('phone')) {
                updatedUser.phone = document.getElementById('phone').value;
            }
            
            if (document.getElementById('address')) {
                updatedUser.address = document.getElementById('address').value;
            }
            
            if (document.getElementById('designation')) {
                updatedUser.designation = document.getElementById('designation').value;
            }
            
            const result = db.users.update(userData.id, updatedUser);
            
            if (result) {
                // Update session data
                currentUser.name = result.name;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Update UI
                updateUserInfo();
                showMessage('Profile updated successfully!', 'success');
            } else {
                showMessage('Failed to update profile. Please try again.', 'error');
            }
        });
    }
    
    // Handle password change
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Verify current password
            if (userData.password !== currentPassword) {
                showMessage('Current password is incorrect.', 'error');
                return;
            }
            
            // Check if new passwords match
            if (newPassword !== confirmPassword) {
                showMessage('New passwords do not match.', 'error');
                return;
            }
            
            // Update password
            const result = db.users.update(userData.id, {
                password: newPassword
            });
            
            if (result) {
                showMessage('Password changed successfully!', 'success');
                passwordForm.reset();
            } else {
                showMessage('Failed to change password. Please try again.', 'error');
            }
        });
    }
    
    // Handle profile image change
    if (changeImageBtn && imageUpload) {
        changeImageBtn.addEventListener('click', function() {
            imageUpload.click();
        });
        
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Update image in UI
                    document.getElementById('profileImage').src = e.target.result;
                    
                    // In a real app, you would upload this file to a server
                    // Here we just store the data URL in localStorage
                    const result = db.users.update(userData.id, {
                        profileImage: e.target.result
                    });
                    
                    if (result) {
                        // Update session data
                        currentUser.profileImage = e.target.result;
                        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        // Update UI
                        updateUserInfo();
                        showMessage('Profile image updated successfully!', 'success');
                    } else {
                        showMessage('Failed to update profile image. Please try again.', 'error');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    // Create message container if it doesn't exist
    let messageContainer = document.getElementById('messageContainer');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.zIndex = '9999';
        document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.style.padding = '10px 20px';
    messageElement.style.margin = '10px 0';
    messageElement.style.borderRadius = '4px';
    messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    messageElement.style.transition = 'all 0.3s ease';
    
    // Set background color based on message type
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.borderLeft = '4px solid #28a745';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
            messageElement.style.borderLeft = '4px solid #dc3545';
            break;
        case 'warning':
            messageElement.style.backgroundColor = '#fff3cd';
            messageElement.style.color = '#856404';
            messageElement.style.borderLeft = '4px solid #ffc107';
            break;
        default: // info
            messageElement.style.backgroundColor = '#d1ecf1';
            messageElement.style.color = '#0c5460';
            messageElement.style.borderLeft = '4px solid #17a2b8';
    }
    
    messageElement.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.marginLeft = '10px';
    closeButton.style.float = 'right';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    closeButton.addEventListener('click', function() {
        messageContainer.removeChild(messageElement);
    });
    
    messageElement.appendChild(closeButton);
    messageContainer.appendChild(messageElement);
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
        if (messageContainer.contains(messageElement)) {
            messageContainer.removeChild(messageElement);
        }
    }, 5000);
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear session
            sessionStorage.removeItem('currentUser');
            currentUser = null;
            
            // Redirect to login page
            window.location.href = '../index.html';
        });
    }
}

// Initialize page functionality based on current page
function initPage() {
    // Check if user is logged in
    const isLoggedIn = checkLogin();
    
    // Setup page-specific functionality
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path.endsWith('/')) {
        setupLoginPage();
    } else if (path.includes('/user/')) {
        if (path.includes('dashboard.html')) {
            setupUserDashboard();
        } else if (path.includes('search.html')) {
            setupSearch();
        } else if (path.includes('book-details.html')) {
            setupBookDetails();
        } else if (path.includes('profile.html')) {
            setupProfilePage();
        }
        
        // Setup logout button
        setupLogout();
    } else if (path.includes('/librarian/')) {
        if (path.includes('dashboard.html')) {
            setupLibrarianDashboard();
        } else if (path.includes('profile.html')) {
            setupProfilePage();
        }
        
        // Setup logout button
        setupLogout();
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
