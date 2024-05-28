CREATE TABLE `Books` (
	`id`	int	NOT NULL,
	`title`	text	NULL,
	`content`	text	NULL,
	`contentLength`	int	NULL
);

CREATE TABLE `Records` (
	`id`	int	NOT NULL,
	`bookId`	int	NOT NULL,
	`username`	VARCHAR(20)	NULL,
	`startTime`	int	NULL,
	`endTime`	int	NULL,
	`takenTime`	int	NULL
);

