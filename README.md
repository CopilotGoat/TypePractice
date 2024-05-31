# 타자연습 사이트의 서버

해당 브랜치(backend)는 가천대학교 AI프로그래밍 입문(웹프로그래밍)의 1조 사이트(타자연습)의 서버입니다.

## 사용 프레임워크
- [Go 1.21.10](https://go.dev/)
- [echo 4.12.0](https://echo.labstack.com/)
- [go-sqlite3 1.14.22](https://mattn.github.io/go-sqlite3/)

## API
### 문서 가져오기
```
GET /book
```
|Param|설명|자료형|필수여부|
|---|---|---|---|
|bookId|가져오고자 하는 문서 ID|int|X
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
GET /ranking
```
|Param|설명|자료형|필수여부|
|---|---|---|---|
|bookId|가져오고자 하는 랭킹의 문서 ID|int|O
|startRanking|몇 위부터 가져올지 결정|int|X(기본값 1)
|limit|몇 개의 랭킹을 가져올지 결정|int|X(기본값 10)
```json
// limit=2, bookId=1 응답 예시
{
    "id": 3,
    "bookId": 1,
    "username": "string",
    "startTime": 10,
    "endTime": 20,
    "takenTime": 10,
    "score": 50
},
{
    "id": 1,
    "bookId": 1,
    "username": "string",
    "startTime": 5,
    "endTime": 18,
    "takenTime": 13,
    "score": 30
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
    "endTime": 0, //endTime > startTime
    "score": 0
}
```
해당 결과를 DB에 등록합니다. 위 모든 항목이 필수이며, endTime은 startTime보다 작을 수 없습니다. 등록 후 등록한 결과가 몇 위인지 반환합니다.
```json
{
    "rank": 0
}
```

## 설치
### 필요 패키지
- Go 1.20
- sqlite3
### 방법
```
git clone https://github.com/CopilotGoat/tmp
cd tmp
git checkout backend
sqlite3
sudo go run .
```
중간에 sqlite3 쉘로 들어가면 아래 명령어를 입력해줍니다.
```
.open data.db
.read tables.sql
.quit
```
