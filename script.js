
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
                return description;
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
                        return description;
                    });
            } else {
                return console.log("No description available.");
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
      console.log("results" + data.docs);
      console.log("results length" + data.docs.length);
      console.log("first result: " + data.docs[0].title);
      console.log("first result author: " + data.docs[0].author_name);
      console.log("first result year: " + data.docs[0].first_publish_year);

      const isbn = data.docs[0].isbn?.[0];
      console.log(isbn)
      

      fetchBookDescription(isbn).then(bookDescription => {
          console.log("bookDescription:", bookDescription);
          document.getElementById('book-description').textContent = bookDescription;
      });
      document.getElementById('book-title').textContent = data.docs[0].title;
      document.getElementById('book-author').textContent = data.docs[0].author_name;
      document.getElementById('book-year').textContent = data.docs[0].first_publish_year;
      document.getElementById('book-cover').src = `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`;
      document.getElementById('book-cover').alt = `Cover of ${data.docs[0].title}`;
      document.getElementById('book-cover').style.display = 'block';

    })
    .catch(error => {
      console.error("Request failed:", error);
    });

}