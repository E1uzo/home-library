const CATEGORIES = ["Фантастика", "Детектив", "Классика", "Наука и IT", "Биография"] as const;
type Category = typeof CATEGORIES[number];

interface Book {
  id: string;
  title: string;
  author: string;
  category: Category;
}

let books: Book[] = JSON.parse(localStorage.getItem("library_books") || "[]");
let selectedCategory: Category = CATEGORIES[0];
let editingBookId: string | null = null;

const bookForm = document.getElementById("book-form") as HTMLFormElement;
const bookIdInput = document.getElementById("book-id") as HTMLInputElement;
const titleInput = document.getElementById("book-title") as HTMLInputElement;
const authorInput = document.getElementById("book-author") as HTMLInputElement;
const categorySelect = document.getElementById("book-category") as HTMLSelectElement;
const formTitle = document.getElementById("form-title") as HTMLHeadingElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;

const categoriesListContainer = document.getElementById("categories-list") as HTMLDivElement;
const booksListContainer = document.getElementById("books-list") as HTMLDivElement;

function saveToStorage(): void {
  localStorage.setItem("library_books", JSON.stringify(books));
}

function initCategorySelect(): void {
  categorySelect.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function renderCategories(): void {
  categoriesListContainer.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const div = document.createElement("div");
    div.className = `category-item ${cat === selectedCategory ? "active" : ""}`;
    
    const count = books.filter(b => b.category === cat).length;
    div.textContent = `${cat} (${count})`;

    div.addEventListener("click", (): void => {
      selectedCategory = cat;
      renderCategories();
      renderBooks();
    });

    categoriesListContainer.appendChild(div);
  });
}

function renderBooks(): void {
  booksListContainer.innerHTML = "";
  
  const filteredBooks = books.filter((book) => book.category === selectedCategory);

  if (filteredBooks.length === 0) {
    booksListContainer.innerHTML = "<p>В этой категории пока нет книг.</p>";
    return;
  }

  filteredBooks.forEach((book) => {
    const div = document.createElement("div");
    div.className = "book-item";
    div.innerHTML = `
      <strong>${book.title}</strong><br>
      <small>Автор: ${book.author}</small>
      <div class="book-actions">
        <button class="edit-btn" data-id="${book.id}">Редактировать</button>
        <button class="delete-btn" data-id="${book.id}">Удалить</button>
      </div>
    `;

    div.querySelector(".edit-btn")?.addEventListener("click", (e: Event) => {
      const id = (e.target as HTMLButtonElement).getAttribute("data-id");
      if (id) startEdit(id);
    });

    div.querySelector(".delete-btn")?.addEventListener("click", (e: Event) => {
      const id = (e.target as HTMLButtonElement).getAttribute("data-id");
      if (id) deleteBook(id);
    });

    booksListContainer.appendChild(div);
  });
}

bookForm.addEventListener("submit", (e: SubmitEvent): void => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const category = categorySelect.value as Category;

  if (!title || !author) return;

  if (editingBookId) {
    books = books.map((b) => (b.id === editingBookId ? { ...b, title, author, category } : b));
    editingBookId = null;
  } else {
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      author,
      category,
    };
    books.push(newBook);
    selectedCategory = category;
  }

  saveToStorage();
  resetForm();
  renderCategories();
  renderBooks();
});

function startEdit(id: string): void {
  const book = books.find((b) => b.id === id);
  if (!book) return;

  editingBookId = id;
  bookIdInput.value = book.id;
  titleInput.value = book.title;
  authorInput.value = book.author;
  categorySelect.value = book.category;

  formTitle.textContent = "Редактировать книгу";
  submitBtn.textContent = "Сохранить изменения";
  cancelBtn.style.display = "inline-block";
}

function deleteBook(id: string): void {
  if (confirm("Вы уверены, что хотите удалить эту книгу?")) {
    books = books.filter((b) => b.id !== id);
    saveToStorage();
    renderCategories();
    renderBooks();
  }
}

function resetForm(): void {
  editingBookId = null;
  bookForm.reset();
  bookIdInput.value = "";
  formTitle.textContent = "Добавить книгу";
  submitBtn.textContent = "Сохранить";
  cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", (): void => {
  resetForm();
});

initCategorySelect();
renderCategories();
renderBooks();
