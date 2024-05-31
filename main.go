package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
)

var _sqlPath = "./data.db"
var _db *sql.DB

func main() {
	//make echo server on 80
	e := echo.New()
	origin := "*"
	db, err := sql.Open("sqlite3", _sqlPath)
	if err != nil {
		e.Logger.Fatal(err)
	}
	_db = db
	e.GET("/book", func(c echo.Context) error {
		c.Response().Header().Add("Access-Control-Allow-Origin", origin)
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
		id, _ := strconv.Atoi(bookId)
		book, err := getBookById(id)
		if err != nil {
			return c.String(http.StatusNotFound, err.Error())
		}
		return c.String(http.StatusOK, book.ToJson())
	})
	e.POST("/typing", func(c echo.Context) error {
		c.Response().Header().Add("Access-Control-Allow-Origin", origin)
		//jsondata: username, bookId, startTime, endTime, score
		// myRank := 0
		var record Record
		if err := c.Bind(&record); err != nil {
			return c.String(http.StatusBadRequest, err.Error())
		}
		if record.BookId == 0 || record.Username == "" || record.StartTime == 0 || record.EndTime == 0 || record.Score == 0 {
			return c.String(http.StatusBadRequest, "bookId, username, startTime, endTime, score should be provided")
		}
		if record.TakenTime = record.EndTime - record.StartTime; record.TakenTime < 0 {
			return c.String(http.StatusBadRequest, "endTime should be greater than startTime")
		}
		if strings.Contains(record.Username, ";") || strings.Contains(record.Username, "--") || strings.Contains(record.Username, "\"") || strings.Contains(record.Username, "'"){
			return c.String(http.StatusBadRequest, "username should not contain sql")
		}
		record.AddToDB()
		
		return c.String(http.StatusOK, fmt.Sprintf("{\"rank\": %d}", record.GetMyRanking()))
	})
	e.GET("/ranking", func(c echo.Context) error {
		c.Response().Header().Add("Access-Control-Allow-Origin", origin)
		//param: bookId, limit, startRanking
		bookId := c.QueryParam("bookId")
		limit := c.QueryParam("limit")
		startRanking := c.QueryParam("startRanking")
		var (
			bookIdInt, limitInt, startRankingInt int
		)
		if bookId == "" {
			return c.String(http.StatusBadRequest, "bookId should be provided")
		}
		bookIdInt, _ = strconv.Atoi(bookId)
		if limit == "" {
			limitInt = 10
		} else {
			limitInt, _ = strconv.Atoi(limit)
		}
		if startRanking == "" {
			startRankingInt = 1
		} else {
			startRankingInt, _ = strconv.Atoi(startRanking)
		}
		rankings := getRanking(bookIdInt, limitInt, startRankingInt)
		json := "["
		for i, record := range rankings {
			json += record.ToJson()
			if i != len(rankings)-1 {
				json += ","
			}
		}
		json += "]";
		return c.String(http.StatusOK, json)
	})
	args := os.Args[1:]
	if args[0] == "test" {
		fmt.Println("========================================\nTest mode\n========================================")
		e.Logger.Fatal(e.Start(":8080"))
	} else {
		e.Logger.Fatal(e.StartTLS(":8080", "certificate.crt", "private.key"))
	}
}
