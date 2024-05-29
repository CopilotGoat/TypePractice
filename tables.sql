CREATE TABLE `Books` (
	`id`	integer	NOT NULL PRIMARY KEY AUTOINCREMENT,
	`title`	text	NULL,
	`content`	text	NULL,
	`contentLength`	int	NULL
);

CREATE TABLE `Records` (
	`id`	integer	NOT NULL PRIMARY KEY AUTOINCREMENT,
	`bookId`	int	NOT NULL,
	`username`	VARCHAR(20)	NULL,
	`startTime`	int	NULL,
	`endTime`	int	NULL,
	`takenTime`	int	NULL,
	`score` int NULL
);