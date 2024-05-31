package main

import "fmt"

type Record struct {
	Id        int64
	BookId    int    `json:"bookId"`
	Username  string `json:"username"`
	StartTime int    `json:"startTime"`
	EndTime   int    `json:"endTime"`
	TakenTime int
	Score     int `json:"score"`
}

func (r *Record) AddToDB() {
	res, err := _db.Exec("INSERT INTO Records (bookId, username, startTime, endTime, takenTime, score) VALUES (?, ?, ?, ?, ?, ?)", r.BookId, r.Username, r.StartTime, r.EndTime, r.TakenTime, r.Score)
	if err != nil {
		println(err.Error())
		return
	}
	r.Id, _ = res.LastInsertId()
}
func (r *Record) ToJson() string {
	return fmt.Sprintf("{\"id\":%d,\"bookId\":%d,\"username\":\"%s\",\"startTime\":%d,\"endTime\":%d,\"takenTime\":%d, \"score\": %d}", r.Id, r.BookId, r.Username, r.StartTime, r.EndTime, r.TakenTime, r.Score)
}
func (r *Record) GetMyRanking() int {
	res := _db.QueryRow("select a.r from (select id, rank() over(order by score desc) r from Records where bookId=?) a inner join Records b on b.id=a.id and a.id=?", r.BookId, r.Id)
	var rank int
	res.Scan(&rank)
	return rank
}

func getRanking(boodId int, limit int, startRanking int) []Record {
	records := make([]Record, 0)
	res, _ := _db.Query("SELECT id, bookId, username, startTime, endTime, takenTime, score FROM Records WHERE bookId = ? ORDER BY score DESC", boodId)
	i := 0
	last := startRanking + limit
	for res.Next() {
		i++
		if i < startRanking {
			continue
		}
		if i >= last {
			break
		}
		var record Record
		res.Scan(&record.Id, &record.BookId, &record.Username, &record.StartTime, &record.EndTime, &record.TakenTime, &record.Score)
		records = append(records, record)
	}
	return records
}
