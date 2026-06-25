document.addEventListener("DOMContentLoaded", function () {
    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const USERS_KEY = "yourStoryUsers";
    const CURRENT_USER_KEY = "yourStoryCurrentUser";
    const PROJECTS_KEY = "yourStoryProjects";
    const SUBMISSIONS_KEY = "yourStorySubmittedBooks";


    /* =====================================================
       GENERAL STORAGE HELPERS
    ===================================================== */

    function readStorage(key, fallbackValue) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallbackValue;
        } catch (error) {
            return fallbackValue;
        }
    }

    function writeStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getUsers() {
        return readStorage(USERS_KEY, []);
    }

    function saveUsers(users) {
        writeStorage(USERS_KEY, users);
    }

    function getCurrentUser() {
        return readStorage(CURRENT_USER_KEY, null);
    }

    function setCurrentUser(user) {
        writeStorage(CURRENT_USER_KEY, user);
        updateAccountStatus();
    }

    function clearCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
        updateAccountStatus();
    }

    function getProjects() {
        return readStorage(PROJECTS_KEY, []);
    }

    function saveProjects(projects) {
        writeStorage(PROJECTS_KEY, projects);
        renderProjects();
    }

    function getSubmissions() {
        return readStorage(SUBMISSIONS_KEY, []);
    }

    function saveSubmissions(submissions) {
        writeStorage(SUBMISSIONS_KEY, submissions);
        renderSubmissions();
    }



    function getHomePath() {
        return window.location.pathname.includes("/pages/") ? "../index.html" : "index.html";
    }

    function getLoginPath() {
        return window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
    }

    function showNotice(element, message, type) {
        if (!element) {
            return;
        }

        element.style.display = "block";
        element.textContent = message;
        element.className = "notice";

        if (type) {
            element.classList.add(type);
        }
    }


    /* =====================================================
       ACCOUNT STATUS ON HOME PAGE
    ===================================================== */

    const accountStatus = document.getElementById("account-status");
    const logoutButton = document.getElementById("logout-button");

    function updateAccountStatus() {
        if (!accountStatus) {
            return;
        }

        const currentUser = getCurrentUser();

        if (currentUser) {
            accountStatus.textContent = `Logged in as ${currentUser.username}. Your drafts and submitted books will be saved in this browser.`;

            if (logoutButton) {
                logoutButton.style.display = "inline-block";
            }
        } else {
            accountStatus.textContent = "You are browsing as a guest. Login or register before submitting a book.";

            if (logoutButton) {
                logoutButton.style.display = "none";
            }
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            clearCurrentUser();
        });
    }

    updateAccountStatus();


    /* =====================================================
       REGISTER PAGE
    ===================================================== */

    const registerForm = document.getElementById("register-form");
    const registerNotice = document.getElementById("register-notice");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            const users = getUsers();
            const usernameExists = users.some(function (user) {
                return user.username.toLowerCase() === data.username.toLowerCase();
            });

            if (data.password !== data.confirm_password) {
                showNotice(registerNotice, "Passwords do not match. Fix this before registering.", "error");
                return;
            }

            if (usernameExists) {
                showNotice(registerNotice, "This username already exists. Choose another username or login.", "error");
                return;
            }

            const newUser = {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                phone: data.phone,
                username: data.username,
                password: data.password,
                bookType: data.book_type,
                theme: data.theme,
                occasion: data.occasion || "Not selected",
                wantsPhotos: data.photos === "yes",
                address: data.address || "Not provided",
                delivery: data.delivery || "Not selected",
                createdAt: new Date().toLocaleString()
            };

            users.push(newUser);
            saveUsers(users);
            setCurrentUser({
                username: newUser.username,
                email: newUser.email,
                firstname: newUser.firstname,
                lastname: newUser.lastname
            });

            showNotice(registerNotice, "Registration successful. You are now logged in. Redirecting to the homepage...", "success");

            setTimeout(function () {
                window.location.href = getHomePath();
            }, 1200);
        });
    }


    /* =====================================================
       LOGIN PAGE
    ===================================================== */

    const loginForm = document.getElementById("login-form");
    const loginNotice = document.getElementById("login-notice");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            const users = getUsers();

            const matchingUser = users.find(function (user) {
                return user.username === data.username && user.password === data.password;
            });

            if (!matchingUser) {
                showNotice(loginNotice, "Login failed. Check your username and password, or register first.", "error");
                return;
            }

            setCurrentUser({
                username: matchingUser.username,
                email: matchingUser.email,
                firstname: matchingUser.firstname,
                lastname: matchingUser.lastname
            });

            showNotice(loginNotice, "Login successful. Redirecting to the homepage...", "success");

            setTimeout(function () {
                window.location.href = getHomePath();
            }, 1000);
        });
    }


    /* =====================================================
       SPECIAL OFFER EXPIRY DATE
    ===================================================== */

    const offerDate = document.getElementById("offer-date");

    if (offerDate) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        offerDate.textContent = expiryDate.toDateString();
    }


    /* =====================================================
       HELP BOX
    ===================================================== */

    const helpBox = document.getElementById("help-box");

    if (helpBox) {
        setTimeout(function () {
            helpBox.style.display = "block";
        }, 8000);
    }


    /* =====================================================
       CREATE YOUR BOOK FORM
    ===================================================== */

    const storyForm = document.getElementById("story-form");
    const storyResult = document.getElementById("story-result");
    const saveProjectButton = document.getElementById("save-project");
    const submitBookButton = document.getElementById("submit-book");

    function generateStory(data) {
        const tones = {
            love: "warm and intimate",
            baby: "gentle and joyful",
            grief: "respectful and healing",
            "long-distance": "hopeful and emotional",
            affirmations: "positive and encouraging"
        };

        const tone = tones[data.theme] || "personal";

        return `Title: ${data.title || "A Memory Worth Keeping"}\n\n` +
            `This ${tone} story is created for ${data.receiver || "someone important"}. ` +
            `It remembers ${data.memory || "a meaningful moment"} and turns it into a keepsake ` +
            `that feels personal instead of generic.\n\n` +
            `What makes this memory special is the emotion behind it: ` +
            `${data.emotion || "care, gratitude and connection"}. ` +
            `The final book should feel honest, simple and gift-ready, with a design that supports ` +
            `the story instead of distracting from it.\n\n` +
            `Selected format: ${data.format}. Theme: ${data.theme}.`;
    }

    if (storyForm && storyResult) {
        storyForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(storyForm);
            const data = Object.fromEntries(formData.entries());
            const generatedStory = generateStory(data);
            const currentUser = getCurrentUser();

            const projectData = {
                id: Date.now(),
                username: currentUser ? currentUser.username : "guest",
                title: data.title,
                receiver: data.receiver,
                theme: data.theme,
                format: data.format,
                memory: data.memory,
                emotion: data.emotion,
                story: generatedStory,
                status: "Draft",
                date: new Date().toLocaleString()
            };

            storyResult.textContent = generatedStory;

            if (saveProjectButton) {
                saveProjectButton.disabled = false;
                saveProjectButton.dataset.project = JSON.stringify(projectData);
            }

            if (submitBookButton) {
                submitBookButton.disabled = false;
                submitBookButton.dataset.project = JSON.stringify(projectData);
            }
        });
    }


    /* =====================================================
       SAVE DRAFT
    ===================================================== */

    if (saveProjectButton) {
        saveProjectButton.addEventListener("click", function () {
            if (!saveProjectButton.dataset.project) {
                return;
            }

            const currentUser = getCurrentUser();

            if (!currentUser) {
                alert("Please login or register before saving your book draft.");
                window.location.href = getLoginPath();
                return;
            }

            const projects = getProjects();
            const newProject = JSON.parse(saveProjectButton.dataset.project);
            newProject.username = currentUser.username;
            newProject.status = "Draft";
            newProject.savedAt = new Date().toLocaleString();

            projects.unshift(newProject);
            saveProjects(projects.slice(0, 12));

            saveProjectButton.textContent = "Draft Saved";

            setTimeout(function () {
                saveProjectButton.textContent = "Save Draft";
            }, 1200);
        });
    }


    /* =====================================================
       SUBMIT FINAL BOOK
    ===================================================== */

    if (submitBookButton) {
        submitBookButton.addEventListener("click", function () {
            if (!submitBookButton.dataset.project) {
                return;
            }

            const currentUser = getCurrentUser();

            if (!currentUser) {
                alert("Please login or register before submitting your book.");
                window.location.href = getLoginPath();
                return;
            }

            const submissions = getSubmissions();
            const submittedBook = JSON.parse(submitBookButton.dataset.project);
            submittedBook.username = currentUser.username;
            submittedBook.status = "Submitted for review";
            submittedBook.submittedAt = new Date().toLocaleString();

            submissions.unshift(submittedBook);
            saveSubmissions(submissions.slice(0, 12));

            submitBookButton.textContent = "Book Submitted";
            location.hash = "dashboard";

            setTimeout(function () {
                submitBookButton.textContent = "Submit Book";
            }, 1400);
        });
    }


    /* =====================================================
       DASHBOARD: SAVED DRAFTS
    ===================================================== */

    const dashboardList = document.getElementById("dashboard-list");
    const clearProjectsButton = document.getElementById("clear-projects");

    function renderProjects() {
        if (!dashboardList) {
            return;
        }

        const currentUser = getCurrentUser();
        const projects = getProjects().filter(function (project) {
            return currentUser && project.username === currentUser.username;
        });

        dashboardList.innerHTML = "";

        if (!currentUser) {
            dashboardList.innerHTML = "<li>Login to view your saved drafts.</li>";
            return;
        }

        if (projects.length === 0) {
            dashboardList.innerHTML = "<li>No saved drafts yet. Generate a story and click Save Draft.</li>";
            return;
        }

        projects.forEach(function (project, index) {
            const listItem = document.createElement("li");

            listItem.innerHTML = `
                <span>
                    <strong>${project.title || "Untitled Book"}</strong><br>
                    <small>${project.theme} • ${project.format} • ${project.status} • ${project.savedAt || project.date}</small>
                </span>
                <button data-index="${index}" class="restore-btn">Restore</button>
            `;

            dashboardList.appendChild(listItem);
        });
    }

    if (dashboardList) {
        dashboardList.addEventListener("click", function (event) {
            if (!event.target.classList.contains("restore-btn")) {
                return;
            }

            const currentUser = getCurrentUser();
            const projects = getProjects().filter(function (project) {
                return currentUser && project.username === currentUser.username;
            });
            const selectedProject = projects[event.target.dataset.index];

            if (selectedProject && storyResult) {
                storyResult.textContent = selectedProject.story;
                location.hash = "create";
            }
        });
    }

    if (clearProjectsButton) {
        clearProjectsButton.addEventListener("click", function () {
            const currentUser = getCurrentUser();

            if (!currentUser) {
                return;
            }

            const remainingProjects = getProjects().filter(function (project) {
                return project.username !== currentUser.username;
            });

            saveProjects(remainingProjects);
        });
    }


    /* =====================================================
       DASHBOARD: SUBMITTED BOOKS
    ===================================================== */

    const submittedList = document.getElementById("submitted-list");
    const clearSubmissionsButton = document.getElementById("clear-submissions");

    function renderSubmissions() {
        if (!submittedList) {
            return;
        }

        const currentUser = getCurrentUser();
        const submissions = getSubmissions().filter(function (book) {
            return currentUser && book.username === currentUser.username;
        });

        submittedList.innerHTML = "";

        if (!currentUser) {
            submittedList.innerHTML = "<li>Login to view submitted books.</li>";
            return;
        }

        if (submissions.length === 0) {
            submittedList.innerHTML = "<li>No submitted books yet. Generate a story and click Submit Book.</li>";
            return;
        }

        submissions.forEach(function (book) {
            const listItem = document.createElement("li");

            listItem.innerHTML = `
                <span>
                    <strong>${book.title || "Untitled Book"}</strong><br>
                    <small>${book.format} • ${book.status} • ${book.submittedAt}</small>
                </span>
                <span class="badge">Submitted</span>
            `;

            submittedList.appendChild(listItem);
        });
    }

    if (clearSubmissionsButton) {
        clearSubmissionsButton.addEventListener("click", function () {
            const currentUser = getCurrentUser();

            if (!currentUser) {
                return;
            }

            const remainingSubmissions = getSubmissions().filter(function (book) {
                return book.username !== currentUser.username;
            });

            saveSubmissions(remainingSubmissions);
        });
    }

    renderProjects();
    renderSubmissions();


    /* =====================================================
       DEMO CONTACT FORM MESSAGE
    ===================================================== */

    const demoForms = document.querySelectorAll('form[data-demo="true"]');

    demoForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const notice = form.querySelector(".notice");
            showNotice(notice, "Demo submitted successfully. This is a front-end project, so no real backend is connected.", "success");
        });
    });
});
