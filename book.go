package main

import "fmt"

type Book struct {
	id            int
	title         string
	content       string
	contentLength int
}

func (b *Book) ToJson() string {
	return fmt.Sprintf("{\"id\":%d,\"title\":\"%s\",\"content\":\"%s\",\"length\":%d}", b.id, b.title, b.content, b.contentLength)
}
func getBookList() []Book {
	result, _ := _db.Query("SELECT id, title FROM Books")

	var bookList []Book
	for result.Next() {
		var book Book
		result.Scan(&book.id, &book.title)
		bookList = append(bookList, book)
		// fmt.Println(result)
		fmt.Printf("id: %d, title: %s\n", book.id, book.title)
	}
	return bookList
}
func getBookById(id int) Book {
	var book Book
	_db.QueryRow("SELECT * FROM Books WHERE id = ?", id).Scan(&book.id, &book.title, &book.content, &book.contentLength)
	return book
}
