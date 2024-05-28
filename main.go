package main

import (
	"database/sql"
	"net/http"

	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
)

type Record struct {
	username  string
	book      *Book
	startTime int
	endTime   int
	takenTime int
}

var _sqlPath = "./data.db"
var _db *sql.DB

func main() {
	//make echo server on 80
	e := echo.New()
	db, err := sql.Open("sqlite3", _sqlPath)
	if err != nil {
		e.Logger.Fatal(err)
	}
	_db = db
	e.GET("/book", func(c echo.Context) error {
		//param: bookId
		bookId := c.QueryParam("bookId")
		if bookId == "" {
			//책 리스트 반환
			bookList := getBookList()
			json := "["
			for i, book := range bookList {
				json += book.ToJson()
				if i != len(bookList)-1 {
					json += ","
				}
			}
			json += "]"
			return c.String(http.StatusOK, json)
		}
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.POST("/typing", func(c echo.Context) error {
		//param: team, bookId, startTime, endTime (UNIX timestamp)
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.GET("/ranking", func(c echo.Context) error {
		//return ranking as json
		//param: limit(몇 팀, 기본값 10), startRanking(몇위부터, 기본값 1)
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.Logger.Fatal(e.Start(":8080"))
}
