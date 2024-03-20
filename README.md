# Universal Infinite Chess Notation and Interface

This is an attempt to standardize the notation around [infinite chess](https://en.wikipedia.org/wiki/Infinite_chess) positions and games. Specifically, the notation at hand allows for the compact description of arbitrary infinite chess positions with finitely many pieces and is meant to be an extension of [PGN](https://en.wikipedia.org/wiki/Portable_Game_Notation) for infinite chess. The notation is simultaneously meant to be easy to read for a human as well as for a computer.

In the [mathematical literature on infinite chess](https://www.emis.de/journals/INTEGERS/papers/og2/og2.pdf), the concepts of double pawn moves, promotion, en passant, castling and the fifty-move rule are often discarded. However, many popular variants of [infinite chess played by humans](https://www.infinitechess.org/) feature all these rules, next to fairy pieces and further unorthodox game modes. With this dichotomy in mind, the notation at hand was explicitly developed with the aim of covering all possible rule combinations. This is achieved by allowing for all sorts of optional arguments at the start of a position string, modifying the implied game rules if included.

## Included converter

This repository includes a converter, which can transform the notation at hand into a JSON format more suitable for computer processing, along with some other useful general purpose functions. For information on how to use the program and that JSON format, check [Usage.md](Usage.md).

## Coordinates, Pieces and Moves

A **square** on the infinite board is uniquely identified by its coordinates which have the form `a,b` for integers `a` and `b`. Here, `a` is the x-coordinate and `b` is the y-coordinate of the piece. White pawns move in positive y-direction, while black pawns move in negative y-direction. Square `0,0` is a dark square.

**Pieces** are abbreviated like in standard algebraic chess notation: `p` for pawn, `r` for rook, `n` for knight, `b` for bishop, `q` for queen and `k` for king, where capitalization implies a white piece, while lowercase letters stand for a black piece. We use the following two-letter abbreviations for the most common [fairy pieces](https://en.wikipedia.org/wiki/List_of_fairy_chess_pieces): `am` for amazon, `ha` for hawk, `ch` for chancellor, `ar` for archbishop, `gu` for guard, `ca` for camel, `gi` for giraffe, `ze` for zebra, `ce` for centaur, `rq` for royal queen, `rc` for royal centaur, `ob` for obstacle and `vo` for void.

A **move** is identified by a starting square and end square. The universal format for a single move is given by the string `a,b>c,d`, which means that a piece moved from square `a,b` to square `c,d`. If the moved piece was a pawn that promoted to a different piece `X`, then that piece is simply appended to the end of the string, i.e. `a,b>c,dX`. For example, `3,4>3,5Q` means that a pawn promoted to a white queen, while `-2,4>-2,3n` means that a pawn promoted to a black knight.

While this is already enough to uniquely identify any chess move and to communicate engine moves via a universal interface, the following extra information may be included for human readability:
- The name of the moved piece can be added to the start of the move.
- `>` can be replaced by `x` if the move was a capture.
- `+` can be appended if the move puts the opponent's king in check, while `#` can be appended if the move checkmates the opponent's king.
- The move number in front can be included, as well as spaces, special symbols (=,!,?) and comments in {} brackets at the end that can be freely added to comment a move.

In total, a move can look like `12. P-5,6x-6,7 =R+ !? {Interesting underpromotion}` or `1 ... q-8,2x-6,0 # {Game over}`, for example.

## Describing positions

Most importantly, a **position** requires a list of pieces with their respective coordinates. This is achieved by simply listing the placement of all pieces in the form `K3,4`, separated by the symbol `|` respectively. In total, a piece list looks like
```
K3,4|Q3,5|P3,7|R9,4|k-2,-10|q-2,-9|r-3,4
```

The piece list can be enhanced with these custom rules:
- If a pawn has the ability to make a double move, a `+` is added behind its coordinates in the piece list, e.g. `P3,7+`. Naturally, this ability is lost after the pawn makes a move.
- If a king has castling rights, then he has a `+` behind his coordinates. He can castle with any non-pawn piece having the same y-coordinate as him and also having a `+` behind its coordinates. For example, a `K3,3+` can castle with a `R10,3+` by moving two squares to the right, if no other pieces are between him and the rook, if he is not in check and if `4,3` and `5,3` are not threatened by Black. Naturally, the `+` specification is lost for any piece making a move.

Now we explain the long list of optional arguments that can be added in front of the piece list in order to accommodate custom rules and more information on a given position:
- `w` or `b` in front symbolises whose turn it is in a position. If omitted, it defaults to `w`.
- A square `a,b` in front symbolises en passant rights in the current position, e.g. if the last move played was `P1,3>1,5`, then the current position has en passant rights on square `1,4`. If omitted, no en passant is possible.
- `N/M` with nonnegative integers `N` and `M` symbolises the state of the X-move rule counter. Here, `N` is the number of halfmoves since the last pawn move or capture, while `M` determines the X-move rule of the game (i.e. the number of halfmoves allowed to be played without pawn moves or captures until the players may claim a draw). If omitted, there is no X-move rule.
- A single nonnegative integer `N` determines the fullmove counter of the current position. It starts at `1` in every game and gets incremented after every black move. If omitted, it is assumed to be `1`.
- An entry of the form `(8;Q,R,N|1;n,b,am)` determines the promotion ranks of the current position for the two players, separated by `|`. In this example, White may promote any pawn reaching y-coordinate 8 to a queen, rook or knight, while Black may promote any pawn reaching y-coordinate 1 to a knight, bishop or amazon. If the pieces for a given player are omitted, e.g. `(3|-4;q,r)`, then he may promote to the usual choice of queen, rook, bishop or knight. If this entry is omitted entirely, there are no promotion ranks.
- There is an optional win condition argument, which is `checkmate` by default. It can be changed to completely overhaul the goal of the players in the game, e.g. to `allpiecescaptured` or `threecheck`. An argument of the form `(checkmate|checkmate,allpiecescaptured)` allows for multiple different win conditions for the two players. In this example, White can win by checkmating Black, while Black can win by either checkmate or allpiecescaptured.
- Any additional optional properties of the position can be included in JSON format in { } brackets in the form `{slideLimit: 7, cannotPassTurn: true}`.

In total, the classical starting position of normal chess embedded into the infinite board with the same rules as finite chess takes the form
```
w 0/100 1 (1|8) checkmate P1,2+|P2,2+|P3,2+|P4,2+|P5,2+|P6,2+|P7,2+|P8,2+|p1,7+|p2,7+|p3,7+|p4,7+|p5,7+|p6,7+|p7,7+|p8,7+|R1,1+|R8,1+|r1,8+|r8,8+|N2,1|N7,1|n2,8|n7,8|B3,1|B6,1|b3,8|b6,8|Q4,1|q4,8|K5,1+|k5,8+
```

After the move `4,2>4,4`, it takes the form
```
b 4,3 0/100 1 (1|8) checkmate P1,2+|P2,2+|P3,2+|P4,4|P5,2+|P6,2+|P7,2+|P8,2+|p1,7+|p2,7+|p3,7+|p4,7+|p5,7+|p6,7+|p7,7+|p8,7+|R1,1+|R8,1+|r1,8+|r8,8+|N2,1|N7,1|n2,8|n7,8|B3,1|B6,1|b3,8|b6,8|Q4,1|q4,8|K5,1+|k5,8+
```

## Describing games

A game is played by simply appending legal moves to a starting position. The starting position always needs to be specified, since there is no single natural starting position or ruleset in infinite chess. Moves can be separated from each other by either whitespace characters or `|`.

Furthermore, metadata in square brackets can be freely included in front in order to display information about the game played.

As explained above, moves can either be represented as compactly as possible in chess interface notation `a,b>c,dX`, or they can be written out to look prettier and include all sorts of optional information. Below you can find the same short game starting from the classical piece setup, once written as compactly as possible with all optional arguments omitted, and once written out and commented as extensively as possible.

Long version:
```
[Variant: Classical]
[Version: 1]
[White: Tom]
[Black: Ben]
[Clock: 10+5]
[Date: 2024/03/17 13:42:06]
[Result: 0-1]
[Condition: checkmate]

w 0/100 1 (1;Q,R,B,N|8;q,r,b,n) checkmate {slideLimit: Infinity, cannotPassTurn: true} P1,2+|P2,2+|P3,2+|P4,2+|P5,2+|P6,2+|P7,2+|P8,2+|p1,7+|p2,7+|p3,7+|p4,7+|p5,7+|p6,7+|p7,7+|p8,7+|R1,1+|R8,1+|r1,8+|r8,8+|N2,1|N7,1|n2,8|n7,8|B3,1|B6,1|b3,8|b6,8|Q4,1|q4,8|K5,1+|k5,8+

1. P4,2 > 4,4  | p4,7 > 4,6
2. P4,4 > 4,5  | p3,7 > 3,5
3. P4,5 x 3,6 {White captures en passant} | b6,8 > 3,11 
4. P3,6 x 2,7  | b3,11 > -4,4 ?
5. P2,7 x 1,8 =Q | b-4,4 > 2,-2 +
6. K5,1 > 4,2  | n7,8 > 6,6
7. Q1,8 x 2,8  | k5,8 > 7,8 {Castling}
8. Q2,8 x 1,7  | q4,8 > 0,4
9. Q1,7 > 7,13 + | k7,8 > 8,8
10. Q7,13 x 7,7 + {Queen sacrifice} | k8,8 x 7,7 !!
11. P8,2 > 8,4 ?! | q0,4 > 4,4 # {Bad game from both players}
```

Compact version:
```
0/100 (1|8) P1,2+|P2,2+|P3,2+|P4,2+|P5,2+|P6,2+|P7,2+|P8,2+|p1,7+|p2,7+|p3,7+|p4,7+|p5,7+|p6,7+|p7,7+|p8,7+|R1,1+|R8,1+|r1,8+|r8,8+|N2,1|N7,1|n2,8|n7,8|B3,1|B6,1|b3,8|b6,8|Q4,1|q4,8|K5,1+|k5,8+
4,2>4,4|4,7>4,6|4,4>4,5|3,7>3,5|4,5>3,6|6,8>3,11|3,6>2,7|3,11>-4,4|2,7>1,8Q|-4,4>2,-2|5,1>4,2|7,8>6,6|1,8>2,8|5,8>7,8|2,8>1,7|4,8>0,4|1,7>7,13|7,8>8,8|7,13>7,7|8,8>7,7|8,2>8,4|0,4>4,4
```

The position just before the final move by Black looks like this:
```
b 8,3 0/100 11 (1|8) P1,2+|P2,2+|P3,2+|P5,2+|P6,2+|P7,2+|p5,7+|p6,7+|k7,7|p8,7+|R1,1+|R8,1+|N2,1|N7,1|B3,1|B6,1|b3,8|Q4,1|p4,6|b2,-2|K4,2|n6,6|r6,8|q0,4|P8,4
```
