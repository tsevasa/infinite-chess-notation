# Usage of FormatConverter.js

The [program](FormatConverter.js) is written in javascript in order to allow for easy embedding into web applications. To run it locally on your computer after downloading, use Node.js for example.

It provides some useful general purpose methods for handling infinite chess games and for transforming the infinite chess notation discussed in [README.md](README.md) into a JSON format, which is more suitable for computer processing.

## Notations
From here on, we distinguish between two notation formats:
- The **short notation** is discussed in its entirety in [README.md](README.md). A position or game is encoded by a string.
- The **long notation** encodes positions and games as JSONs. The example game from [README.md](README.md) in long notation is shown below.
```
{"metadata":{
    "Event": "Casual local Classical infinite chess game",
    "Site": "https://www.infinitechess.org/",
    "Variant":"Classical",
    "UTCDate": "2024.08.05",
    "UTCTime": "01:15:47",
    "TimeControl":"600+5",
    "White":"Tom",
    "Black":"Ben",
    "Result":"0-1",
    "Termination":"Checkmate"},
"turn":"white",
"moveRule":"0/100",
"fullMove":1,
"gameRules":{
    "promotionRanks":[8,1],
    "promotionsAllowed":{"white":["queens","rooks","bishops","knights"],"black":["queens","rooks","bishops","knights"]},
    "winConditions":{"white":["checkmate"],"black":["checkmate"]},
    "slideLimit": 100,
    "cannotPassTurn": true},
"specialRights":{"1,2":true,"2,2":true,"3,2":true,"4,2":true,"5,2":true,"6,2":true,"7,2":true,"8,2":true,"1,7":true,"2,7":true,"3,7":true,"4,7":true,"5,7":true,"6,7":true,"7,7":true,"8,7":true,"1,1":true,"8,1":true,"1,8":true,"8,8":true,"5,1":true,"5,8":true},
"startingPosition":{"1,2":"pawnsW","2,2":"pawnsW","3,2":"pawnsW","4,2":"pawnsW","5,2":"pawnsW","6,2":"pawnsW","7,2":"pawnsW","8,2":"pawnsW","1,7":"pawnsB","2,7":"pawnsB","3,7":"pawnsB","4,7":"pawnsB","5,7":"pawnsB","6,7":"pawnsB","7,7":"pawnsB","8,7":"pawnsB","1,1":"rooksW","8,1":"rooksW","1,8":"rooksB","8,8":"rooksB","2,1":"knightsW","7,1":"knightsW","2,8":"knightsB","7,8":"knightsB","3,1":"bishopsW","6,1":"bishopsW","3,8":"bishopsB","6,8":"bishopsB","4,1":"queensW","4,8":"queensB","5,1":"kingsW","5,8":"kingsB"},
"moves":["4,2>4,4", "4,7>4,6", "4,4>4,5", "3,7>3,5", "4,5>3,6", "6,8>3,11", "3,6>2,7", "3,11>-4,4", "2,7>1,8Q", "-4,4>2,-2,", "5,1>4,2", "7,8>6,6", "1,8>2,8", "5,8>7,8", "2,8>1,7", "4,8>0,4", "1,7>7,13", "7,8>8,8", "7,13>7,7", "8,8>7,7", "8,2>8,4", "0,4>4,4"]}
```
The example above showcases the formatting of almost all optional arguments. If a player has no promotion rank, then this can be encoded as `"promotionRanks":[8,undefined]`. Additionally, if en passant at square `a,b` is possible in the initial position, this is encoded as `"enpassant":[a,b]` in the JSON. Crucially, `"startingPosition"` contains the piece list, while `"specialRights"` encodes the `+` signs corresponding to pawn double move and castling rights in the initial position. Finally, `"moves"` is simply a list of moves as strings, each written in short notation.

## Main functions
The program has the following main functions:
- `LongToShort_Format(longformat, compact_moves = 0, make_new_lines = true)` : Given a JSON, this method returns the corresponding position or game in short notation as a string by transforming every JSON entry into its corresponding representation in short format and concatenating them. The optional argument `compact_moves` specifies whether the moves outputted are in compact format or expanded (0: least compact, 1: moderately compact, 2: most compact). The optional argument `make_new_lines` specifies whether line breaks should be used at all in the string.
- `ShortToLong_Format(shortformat)` : Given a string, this method returns an equivalent JSON in long format. The method recognizes all optional arguments in the string with regular expressions, i.e. their order does not matter as long as they are formatted correctly.
- There are a handful of further auxiliary methods that are well documented in the code.

At the start of the program, you can find the piece name dictionary containing all used abbreviations of pieces.

At the end of the program, you can find some example uses of these functions, which were used to generate the game in [README.md](README.md).

## DEPRECATED: Old legacy format for "moves" entry
In the example above, `"moves"` gives the list of moves as a simple list of moves in short notation. However, for backwards compatibility reasons, `LongToShort_Format()` also still supports the old legacy format below as an input:
```
{"moves":[
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
Here, every move specifies the moved piece with `type` and the move's coordinates with `startCoords` and `endCoords`. If a pawn is promoted to another piece, this is specified with `promote`. If a piece is captured, this is specified with `captured`. If this happened en passant, this is specified with `enpassant` (`-1` for a white move, `1` for black for a black move). If the king castles, this is specified with `castle`, containing the x-direction of the king move (`1` or `-1`) and the coordinates of the piece he castled with. Finally, the optional flags `check` and `mate` can be included as well to describe a move.

The following functions only use this old legacy format:
- `GameToPosition(longformat, halfmoves = 0, modify_input = false)` : Given the JSON of a game, this method will return a JSON corresponding to a single position from the game, which is at a certain number of halfmoves after the start. This number is specified by the optional argument `halfmoves`. Setting it to `0` will yield the starting position JSON, while setting it to `Infinity` will yield the final position of the game as a JSON. The optional argument `modify_input` specifies whether the input object is modified in the process or not (setting this to `true` is faster, since no deepcopy of the input object is required).
- `LongToShort_CompactMove(longmove)` and `ShortToLong_CompactMove(shortmove)` : These methods convert a single compact move back and forth from the long legacy format to the short format, i.e. `2,-3>2,-4ha` to `{"startCoords":"2,-3","endCoords":"2,-4","promotion":"hawksB"}` and vice versa. Note that this only supports the compact short notation `a,b>c,dX`.