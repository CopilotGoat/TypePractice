package main

import (
	"database/sql"
	"fmt"
)

type Book struct {
	id            int
	title         string
	content       string
	contentLength sql.NullInt32
}

func (b *Book) ToJson() string {
	s := fmt.Sprintf("{\"id\":%d,\"title\":\"%s\",\"content\":\"%s\",", b.id, b.title, b.content)
	if b.contentLength.Valid {
		s += fmt.Sprintf("\"contentLength\":%d}", b.contentLength.Int32)
	} else {
		s += "\"contentLength\":0}"
	}
	return s
}
func getBookList() []Book {
	result, _ := _db.Query("SELECT id, title FROM Books")

	var bookList []Book
	for result.Next() {
		var book Book
		result.Scan(&book.id, &book.title)
		bookList = append(bookList, book)
	}
	return bookList
}
func getBookById(id int) (Book, error) {
	var book Book
	err := _db.QueryRow("SELECT id, title, content, contentLength FROM Books WHERE id = ?", id).Scan(&book.id, &book.title, &book.content, &book.contentLength)
	if err != nil {
		return book, err
	}
	return book, nil
}
