# 타자연습 사이트의 서버

해당 브랜치(backend)는 가천대학교 AI프로그래밍 입문(웹프로그래밍)의 1조 사이트(타자연습)의 서버입니다.

## 사용 프레임워크
- [Go 1.21.10](https://go.dev/)
- [echo 4.12.0](https://echo.labstack.com/)
- [go-sqlite3 1.14.22](https://mattn.github.io/go-sqlite3/)

## API
### 문서 가져오기
```
GET /book?bookId=(int)
```
```json
{
    "id": 0,
    "title": "string",
    "content": "string",
    "contentLength": 0
}
```
해당 bookId에 맞는 문서를 불러옵니다. 만약 bookId가 비어있다면 모든 문서들의 content를 제외한 정보를 가져옵니다.
```json
[
    {
        "id": 1,
        "title": "string",
        "content": "",
        "contentLength": 0
    },
    {
        "id": 2,
        "title": "string",
        "content": "",
        "contentLength": 0
    },
    {
        "id": 3,
        "title": "string",
        "content": "",
        "contentLength": 0
    }...
]
```
### 랭킹 가져오기
```
GET /ranking?limit=(int)&startRanking=(int)&bookId=<int>
```
해당 {bookId}의 {startRanking}위부터 {limit}개의 랭킹을 불러옵니다. <br>
bookId는 필수이며, limit의 기본값은 10, startRanking의 기본값은 1입니다.
```json
// limit=2, bookId=1 응답 예시
{
    "id": 3,
    "bookId": 1,
    "username": "string",
    "startTime": 10,
    "endTime": 20,
    "takenTime": 10
},
{
    "id": 1,
    "bookId": 1,
    "username": "string",
    "startTime": 5,
    "endTime": 18,
    "takenTime": 13
}
```
### 결과 등록하기
```
POST /typing
```
```json
{
    "username": "string",
    "bookId": 0,
    "startTime": 0,
    "endTime": 0 //endTime > startTime
}
```
해당 결과를 DB에 등록합니다. 위 모든 항목이 필수이며, endTime은 startTime보다 작을 수 없습니다. 등록 후 등록한 결과가 몇 위인지 반환합니다.
```json
{
    "rank": 0
}
```