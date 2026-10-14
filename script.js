
function fetchBookDescription(isbnValue) {
    const url = `https://openlibrary.org/isbn/${isbnValue}.json`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(bookData => {
            console.log("ISBN edition details:", bookData);

            // Try the edition's description first.
            if (bookData.description) {
                const description = typeof bookData.description === "string"
                    ? bookData.description
                    : bookData.description.value;

                console.log("Description:", description);
                return description || "No description available.";
            } 
            
            else if (bookData.works?.[0]?.key) {
                // If the edition has no description, try its associated work.
                const workUrl = `https://openlibrary.org${bookData.works[0].key}.json`;

                return fetch(workUrl)
                    .then(response => response.json())
                    .then(workData => {
                        const description = typeof workData.description === "string"
                            ? workData.description
                            : workData.description?.value;

                        console.log("Description:", description || "No description available.");
                        return description || "No description available.";
                    });
            } else {
                return "No description available";
            }
        })
        .catch(error => console.error("Description request failed:", error));
}

function fetchBookData() {

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(document.getElementById('book-search').value)}&fields=title,author_name,first_publish_year,cover_i,isbn&limit=100`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
        const bookResults = document.getElementById('book-results');
        bookResults.innerHTML = ""; 
        data.docs.slice(0,10).forEach((book) =>{

            console.log("first result: " + book.title);
            console.log("first result author: " + book.author_name);
            console.log("first result year: " + book.first_publish_year);

            const isbn = book.isbn?.[0];
            console.log(isbn)

            const bookCard = document.createElement('div');
            bookCard.classList.add('result-body');
            const bookInfo = document.createElement('div');
            bookInfo.classList.add('book-info');
            const title = document.createElement('h5');
            title.classList.add('book-title');
            title.textContent = book.title;
            const author = document.createElement('h5');
            author.classList.add('book-author');
            author.textContent = book.author_name?.join(', ') || 'Unknown author';
            const year = document.createElement('h5');
            year.classList.add('book-year');
            year.textContent = book.first_publish_year;

            bookInfo.append(title, author, year);

            const description = document.createElement('p');
            description.classList.add('book-description');
            const cover = document.createElement('div');
            cover.classList.add('book-cover');

            bookCard.append(bookInfo, description, cover);
            bookResults.appendChild(bookCard);
            
            if (isbn) {
                fetchBookDescription(isbn).then(bookDescription => {
                    description.textContent = bookDescription;
                });
            } else {
                description.textContent = "No ISBN available.";
            }
            
            if (book.cover_i) {
                const img = document.createElement('img');
                img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
                cover.appendChild(img);
            } else {
                cover.textContent = 'No cover available';
            }
            
        })
    })
    .catch(error => {
      console.error("Request failed:", error);
      alert("Unable to connect to Open Library. Please try again.");
    });

}