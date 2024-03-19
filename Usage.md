# Usage of FormatConverter.js

The program is written in javascript in order to allow for easy embedding into web applications. To run it locally on your computer after downloading, use Node.js for example.

It provides some useful general purpose methods for handling infinite chess games and for transforming the infinite chess notation discussed in [README.md](README.md) into a JSON format, which is more suitable for computer processing.

## Notations
From here on, we distinguish between two notation formats:
- The **short notation** is discussed in its entirety in [README.md](README.md). A position or game is encoded by a string.
- The **long notation** encodes positions and games as JSONs. The example game from [README.md](README.md) in long notation is shown below.
```
{"metadata":{
    "Variant":"Classical",
    "Version":"1",
    "White":"Tom",
    "Black":"Ben",
    "Clock":"10+5",
    "Date":"2024/03/17 13:42:06",
    "Result":"0-1",
    "Condition":"checkmate"},
"turn":"w",
"moveRule":"0/100",
"fullMove":"1",
"gameRules":{
    "promotionRanks":[1,8],
    "promotionsAllowed":{"white":["queens","rooks","bishops","knights"],"black":["queens","rooks","bishops","knights"]},
    "winConditions":{"white":["checkmate"],"black":["checkmate"]},
    "slideLimit": "Infinity"},
"specialRights":{"1,2":true,"2,2":true,"3,2":true,"4,2":true,"5,2":true,"6,2":true,"7,2":true,"8,2":true,"1,7":true,"2,7":true,"3,7":true,"4,7":true,"5,7":true,"6,7":true,"7,7":true,"8,7":true,"1,1":true,"8,1":true,"1,8":true,"8,8":true,"5,1":true,"5,8":true},
"startingPosition":{"1,2":"pawnsW","2,2":"pawnsW","3,2":"pawnsW","4,2":"pawnsW","5,2":"pawnsW","6,2":"pawnsW","7,2":"pawnsW","8,2":"pawnsW","1,7":"pawnsB","2,7":"pawnsB","3,7":"pawnsB","4,7":"pawnsB","5,7":"pawnsB","6,7":"pawnsB","7,7":"pawnsB","8,7":"pawnsB","1,1":"rooksW","8,1":"rooksW","1,8":"rooksB","8,8":"rooksB","2,1":"knightsW","7,1":"knightsW","2,8":"knightsB","7,8":"knightsB","3,1":"bishopsW","6,1":"bishopsW","3,8":"bishopsB","6,8":"bishopsB","4,1":"queensW","4,8":"queensB","5,1":"kingsW","5,8":"kingsB"},
"moves":[
    {"type":"pawnsW","startCoords":[4,2],"endCoords":[4,4]},
    {"type":"pawnsB","startCoords":[4,7],"endCoords":[4,6]},
    {"type":"pawnsW","startCoords":[4,4],"endCoords":[4,5]},
    {"type":"pawnsB","startCoords":[3,7],"endCoords":[3,5]},
    {"type":"pawnsW","startCoords":[4,5],"endCoords":[3,6],"captured":"pawnsB","enpassant":-1},
    {"type":"bishopsB","startCoords":[6,8],"endCoords":[3,11]},
    {"type":"pawnsW","startCoords":[3,6],"endCoords":[2,7],"captured":"pawnsB"},
    {"type":"bishopsB","startCoords":[3,11],"endCoords":[-4,4]},
    {"type":"pawnsW","startCoords":[2,7],"endCoords":[1,8],"captured":"rooksB","promotion":"queensW"},
    {"type":"bishopsB","startCoords":[-4,4],"endCoords":[2,-2],"check":true},
    {"type":"kingsW","startCoords":[5,1],"endCoords":[4,2]},
    {"type":"knightsB","startCoords":[7,8],"endCoords":[6,6]},
    {"type":"queensW","startCoords":[1,8],"endCoords":[2,8],"captured":"knightsB"},
    {"type":"kingsB","startCoords":[5,8],"endCoords":[7,8],"castle":{"dir":1,"coord":[8,8]}},
    {"type":"queensW","startCoords":[2,8],"endCoords":[1,7],"captured":"pawnsB"},
    {"type":"queensB","startCoords":[4,8],"endCoords":[0,4]},
    {"type":"queensW","startCoords":[1,7],"endCoords":[7,13],"check":true},
    {"type":"kingsB","startCoords":[7,8],"endCoords":[8,8]},
    {"type":"queensW","startCoords":[7,13],"endCoords":[7,7],"captured":"pawnsB","check":true},
    {"type":"kingsB","startCoords":[8,8],"endCoords":[7,7],"captured":"queensW"},
    {"type":"pawnsW","startCoords":[8,2],"endCoords":[8,4]},
    {"type":"queensB","startCoords":[0,4],"endCoords":[4,4],"check":true,"mate":true}]}
```
The formatting of all optional arguments above is self-evident. `startingPosition` contains the piece list, while `specialRights` encodes the `+` signs corresponding to pawn double move and castling rights.

Finally, `moves` is a list of moves. Every move specifies the moved piece with `type` and the coordinates with `startCoords` and `endCoords`. If a piece is captured, this is specified with `captured`. If this happened en passant, this is specified with `enpassant` (`-1` for white, `1` for black). Finally, if the king castles, this is specified with `castle`, containing the x-direction of the king move and the coordinates of the piece he castled with.

## Functions
The program has the following functions:
- `LongToShort_Format(longformat, compact_moves = false)` : Given a JSON, this method returns the corresponding position or game in short notation as a string by transforming every JSON entry into its corresponding representation in short format. The optional argument `compact_moves` specifies whether the moves outputted are in compact format or expanded.
- `function ShortToLong_Format(shortformat)` : Given a string, this method returns an equivalent JSON in long format. The method recognizes all optional arguments in the string with regular expressions, i.e. their order does not matter as long as they are formatted correctly. If moves are included at the end of the string, the method will reconstruct all flags in the long format (except check and checkmate) from the starting position and move list. Inputting illegal moves may crash the program.
- `function GameToPosition(longformat, halfmoves = 0)` : Given the JSON of a game, this method will return a JSON corresponding to a single position from the game, which is at a certain number of halfmoves after the start. This number is specified by the optional argument `halfmoves`. Setting it to `0` will yield the starting position, while setting it to `Infinity` will yield the final position of the game.
