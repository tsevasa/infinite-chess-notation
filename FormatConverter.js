const pieceDictionary =
    {
        "kingsW": "K", "kingsB": "k",
        "pawnsW": "P", "pawnsB": "p",
        "knightsW": "N", "knightsB": "n",
        "bishopsW": "B", "bishopsB": "b",
        "rooksW": "R", "rooksB": "r",
        "queensW": "Q", "queensB": "q",
        "amazonsW": "AM", "amazonsB": "am",
        "hawksW": "HA", "hawksB": "ha",
        "chancellorsW": "CH", "chancellorsB": "ch",
        "archbishopsW": "AR", "archbishopsB": "ar",
        "guardsW": "GU", "guardsB": "gu",
        "camelsW": "CA", "camelsB": "ca",
        "giraffesW": "GI", "giraffesB": "gi",
        "zebrasW": "ZE", "zebrasB": "ze",
        "centaursW": "CE", "centaursB": "ce",
        "royalQueensW": "RQ", "royalQueensB": "rq",
        "royalCentaursW": "RC", "royalCentaursB": "rc",
        "obstaclesN": "ob",
        "voidsN": "vo"
    };

function invertDictionary(json){
    let inv = {};
    for(let key in json){
        inv[json[key]] = key;
    }
    return inv;
}

const invertedpieceDictionary = invertDictionary(pieceDictionary);

function LongToShort_Piece(longpiece){
    if (!pieceDictionary.hasOwnProperty(longpiece)){
        console.error("Unknown piece type detected: "+longpiece);
    }
    return pieceDictionary[longpiece];
}

function ShortToLong_Piece(shortpiece){
    if (!invertedpieceDictionary.hasOwnProperty(shortpiece)){
        console.error("Unknown piece abbreviation detected: "+shortpiece);
    }
    return invertedpieceDictionary[shortpiece];
}


/**
 * Converts a gamefile in JSON format to Infinite Chess Notation.
 * @param {object} longformat - The gamefile in JSON format
 * @param {number} compact_moves - Number between 0-2 for how compact you want the resulting ICN (0 = least compact, 1: moderately compact, 2: most compact)
 * @param {boolean} make_new_lines - Boolean specifying whether linebreaks should be included in the output string
 * @returns {string} The ICN of the gamefile as a string
 */
function LongToShort_Format(longformat, compact_moves = 0, make_new_lines = true){
    let shortformat = "";
    let whitespace = (make_new_lines ? "\n" : " ");
    // metadata
    for (let key in longformat["metadata"]){
        shortformat += "[" + key + ": " + longformat["metadata"][key] + "]" + whitespace;
    }
    if (longformat["metadata"]){
        shortformat += whitespace;
    }

    // move turn
    let next_move = "w";
    if (longformat["turn"] == "black"){
        shortformat += "b ";
        next_move = "b";
    } else if (longformat["turn"] == "white"){
        shortformat += "w ";
        next_move = "w";
    }

    // en passant
    if(longformat["enpassant"]){
        shortformat += longformat["enpassant"].toString() + " ";
    }

    // X move rule
    if(longformat["moveRule"]){
        shortformat += longformat["moveRule"].toString() + " ";
    }

    // full move counter
    let fullmove = 1;
    if(longformat["fullMove"]){
        shortformat += longformat["fullMove"].toString() + " ";
        fullmove = parseInt(longformat["fullMove"]);
    }

    // promotion lines, currently assumes that "promotionRanks" is always defined as a list of length 2, if it is defined
    if (longformat["gameRules"]){
        if(longformat["gameRules"]["promotionRanks"]){
            shortformat += "(";
            if (longformat["gameRules"]["promotionRanks"][0] != null){
                let promotionListWhite = (longformat["gameRules"]["promotionsAllowed"] ? longformat["gameRules"]["promotionsAllowed"]["white"] : null);
                shortformat += longformat["gameRules"]["promotionRanks"][0];
                if (promotionListWhite){
                    if (!(promotionListWhite.length == 4 && promotionListWhite.includes("rooks") && promotionListWhite.includes("queens") && promotionListWhite.includes("bishops") && promotionListWhite.includes("knights"))){
                        shortformat += ";";
                        for (let longpiece of promotionListWhite){
                            shortformat += LongToShort_Piece(longpiece + "W") + ",";
                        }
                        shortformat = shortformat.slice(0, -1);
                    }
                }
            }
            shortformat += "|";
            if (longformat["gameRules"]["promotionRanks"][1] != null){
                let promotionListBlack = (longformat["gameRules"]["promotionsAllowed"] ? longformat["gameRules"]["promotionsAllowed"]["black"] : null);
                shortformat += longformat["gameRules"]["promotionRanks"][1];
                if (promotionListBlack){
                    if (!(promotionListBlack.length == 4 && promotionListBlack.includes("rooks") && promotionListBlack.includes("queens") && promotionListBlack.includes("bishops") && promotionListBlack.includes("knights"))){
                        shortformat += ";";
                        for (let longpiece of promotionListBlack){
                            shortformat += LongToShort_Piece(longpiece + "B") + ",";
                        }
                        shortformat = shortformat.slice(0, -1);
                    }
                }
            }
            shortformat += ") ";
        }
    }

    // win condition
    if (longformat["gameRules"]){
        if(longformat["gameRules"]["winConditions"]){
            let whitewins = longformat["gameRules"]["winConditions"]["white"];
            let blackwins = longformat["gameRules"]["winConditions"]["black"];
            if (whitewins && blackwins){
                let wins_are_equal = true;
                if (whitewins.length == blackwins.length){
                    for (let i = 0; i < whitewins.length; i++){
                        let white_win_i_is_black_win = false;
                        for (let j = 0; j < blackwins.length; j++){
                            if (whitewins[i] == blackwins[j]){
                                white_win_i_is_black_win = true;
                                break;
                            }
                        }
                        if (!white_win_i_is_black_win){
                            wins_are_equal = false;
                        }
                    }
                } else{
                    wins_are_equal = false;
                }
                
                if (wins_are_equal){
                    shortformat += whitewins.toString() + " ";
                } else{
                    shortformat += "(" + whitewins.toString() + "|" + blackwins.toString() + ") ";
                }

            }
        }
    }

    // other game rules
    shortformat += "{";
    let added_extras = false;
    for (let key in longformat["gameRules"]){
        if (key != "promotionRanks" && key != "promotionsAllowed" && key != "winConditions"){
            if (!(key == "slideLimit" && longformat["gameRules"][key] == "Infinity")){
                shortformat += key.toString() + ": " + longformat["gameRules"][key].toString() + ", ";
                added_extras = true;
            }
        }
    }
    shortformat = shortformat.slice(0, -1);
    if (added_extras){
        shortformat = shortformat.slice(0, -1) +"} ";
    }

    // position
    for (let coordinate in longformat["startingPosition"]){
        shortformat += LongToShort_Piece(longformat["startingPosition"][coordinate]) + coordinate;
        if (longformat["specialRights"][coordinate]){
            shortformat += "+";
        }
        shortformat += "|";
    }
    if (longformat["startingPosition"]){
        shortformat = shortformat.slice(0, -1);
        if (longformat["moves"]){
            shortformat += whitespace + whitespace;
        }
    }

    // moves
    if (longformat["moves"]){
        for (let i = 0; i < longformat["moves"].length; i++){
            let longmove = longformat["moves"][i];
            if (next_move == "w" && compact_moves == 0){
                shortformat += (!make_new_lines && i != 0 ? " " : "");
                shortformat += fullmove.toString() + ". ";
            } else if (compact_moves == 0){
                shortformat += (i == 0 ? fullmove.toString() + ".   ...   | " : " | ");
            } else {
                shortformat += (i == 0 ? "" : "|");
            }
            shortformat += (compact_moves == 0 || compact_moves == 1 ? LongToShort_Piece(longmove["type"]) : "");
            shortformat += longmove["startCoords"][0].toString()+ "," + longmove["startCoords"][1].toString();
            shortformat += (compact_moves == 0 ? " " : "");
            shortformat += (longmove["captured"] && (compact_moves == 0 || compact_moves == 1) ? "x" : ">");
            shortformat += (compact_moves == 0 ? " " : "");
            shortformat += longmove["endCoords"][0].toString()+ "," + longmove["endCoords"][1].toString();
            shortformat += (compact_moves == 0 ? " " : "");
            if (longmove["promotion"]){
                shortformat += (compact_moves == 0 || compact_moves == 1? "=" : "");
                shortformat += LongToShort_Piece(longmove["promotion"]);
            }
            if (longmove["mate"] && (compact_moves == 0 || compact_moves == 1)){
                shortformat += "\#";
            } else if (longmove["check"] && (compact_moves == 0 || compact_moves == 1)){
                shortformat += "+";
            }
            shortformat = shortformat.trimEnd();
            if (next_move == "w"){
                next_move = "b";
            } else{
                next_move = "w";
                fullmove += 1;
                if (i != longformat["moves"].length - 1 && compact_moves == 0){
                    shortformat += (make_new_lines ? "\n" : " |");
                }
            }
        }
    }
    
    return shortformat.trimEnd();
}

/**
 * Converts a string in Infinite Chess Notation to gamefile in JSON format
 * @param {string} shortformatOG - A string in ICN
 * @returns {object} Equivalent gamefile in JSON format
 */
function ShortToLong_Format(shortformatOG){
    let longformat = {};
    let shortformat = structuredClone(shortformatOG);

    // metadata handling. Don't put ": " in metadata fields.
    let metadata = {};
    while (shortformat.indexOf("[") > -1){
        let start_index = shortformat.indexOf("[");
        let end_index = shortformat.indexOf("]");
        if (end_index == -1){
            console.error("Unclosed [ detected");
            return {};
        }
        let metadatastring = shortformat.slice(start_index+1,end_index);
        shortformat = shortformat.slice(0,start_index) + shortformat.slice(end_index+1);
        
        let split_index = metadatastring.indexOf(": ");
        if (split_index > -1){
            metadata[metadatastring.slice(0,split_index)] = metadatastring.slice(split_index+2);
        } else{
            metadata[metadatastring] = "";
        }
    }
    if (Object.keys(metadata).length != 0){
        longformat["metadata"] = metadata;
    }

    while(shortformat != ""){
        if (/\s/.test(shortformat[0])){
            shortformat = shortformat.slice(1);
            continue;
        }
        let index = shortformat.search(/\s/);
        if (index == -1){
            index = shortformat.length;
        }
        let string = shortformat.slice(0,index);
        shortformat = shortformat.slice(index+1);

        // move turn
        if (!longformat["turn"] && /^(w|b)$/.test(string)){
            longformat["turn"] = (string == "b" ? "black" : "white");
            continue;
        }

        // en passant
        if (!longformat["enpassant"] && /^(-?[0-9]+,-?[0-9]+)$/.test(string)){
            longformat["enpassant"] = string;
            continue;
        }

        // X move rule
        if (!longformat["moveRule"] && /^([0-9]+\/[0-9]+)$/.test(string)){
            longformat["moveRule"] = string;
            continue;
        }

        // full move counter
        if(!longformat["fullMove"] && /^([0-9]+)$/.test(string)){
            longformat["fullMove"] = string;
            continue;
        }

        // promotion lines
        if(/^((\(-?[0-9]+.*\|.*\))|(\(.*\|-?[0-9]+.*\))|(\(\|\)))$/.test(string)){
            if (!longformat["gameRules"]){
                longformat["gameRules"] = {};
            }
            if (!longformat["gameRules"]["promotionRanks"]){
                string = string.replace(/[\(\)]+/g,"").split("|");
                longformat["gameRules"]["promotionRanks"] = [];
                longformat["gameRules"]["promotionsAllowed"] = {};
                for (let i = 0; i < 2; i++){
                    let color = (i==0 ? "white" : "black");
                    if (string[i] != "" && string[i] != null){
                        let promotionLine = (string[i].indexOf(";") == -1 ? parseInt(string[i]) : parseInt(string[i].split(";")[0]));
                        longformat["gameRules"]["promotionRanks"].push(promotionLine);
                        string[i] = string[i].split(";");
                        if (string[i].length == 1){
                            longformat["gameRules"]["promotionsAllowed"][color] = ["queens","rooks","bishops","knights"];
                        } else{
                            longformat["gameRules"]["promotionsAllowed"][color] = [];
                            for (let promotionpiece of string[i][1].split(",")){
                                longformat["gameRules"]["promotionsAllowed"][color].push(ShortToLong_Piece(promotionpiece).slice(0,-1));
                            }
                        }
                    } else{
                        longformat["gameRules"]["promotionRanks"].push(undefined);
                    }
                }
                continue;
            }
        }

        // win condition (has to start with a letter or bracket+letter)
        if(/^(\(?[a-zA-z].*)$/.test(string)){
            if (!longformat["gameRules"]){
                longformat["gameRules"] = {};
            }
            if (!longformat["gameRules"]["winConditions"]){
                longformat["gameRules"]["winConditions"] = {};
                string = string.replace(/[\(\)]/g,"").split("|");
                if (string.length == 1){
                    string.push(string[0]);
                }
                for (let i = 0; i < 2; i++){
                    let color = (i==0 ? "white" : "black");
                    longformat["gameRules"]["winConditions"][color] = [];
                    for (let wincon of string[i].split(",")){
                        longformat["gameRules"]["winConditions"][color].push(wincon);
                    }
                }
                continue;
            }
        }

        // other game rules in {} brackets. Don't put ":" in gamerules text.
        if(string[0] == "{"){
            if (!longformat["gameRules"]){
                longformat["gameRules"] = {};
            }
            shortformat = string + " "+ shortformat;
            let end_index = shortformat.indexOf("}");
            if (end_index == -1){
                console.error("Unclosed { detected");
                return {};
            }
            string = shortformat.slice(1,end_index);
            shortformat = shortformat.slice(end_index+1);
            
            string = string.split(",");
            for (let i = 0; i<string.length; i++){
                let end_key = string[i].indexOf(":");
                let key = string[i].slice(0,end_key).trimStart().trimEnd();
                let value = string[i].slice(end_key+1,-1).trimStart().trimEnd();
                longformat["gameRules"][key] = value;
            }
            continue;
        }

        // position
        if(!longformat["startingPosition"] && /^([a-zA-z]+-?[0-9]+.*)$/.test(string)){
            longformat["specialRights"] = {};
            longformat["startingPosition"] = {};
            string = string.split("|");
            for (let i=0; i < string.length; i++){
                if (string[i] == ""){
                    continue;
                }
                let shortpiece = "";
                while(true){
                    let current_char = string[i][0];
                    if (/[a-zA-Z]/g.test(current_char)){
                        shortpiece = shortpiece + current_char;
                        string[i] = string[i].slice(1);
                    } else {
                        break;
                    }
                }
                if (string[i].slice(-1) == "+"){
                    longformat["specialRights"][string[i].slice(0,-1)] = true;
                }
                longformat["startingPosition"][string[i].replace(/[+]*/g,"")] = ShortToLong_Piece(shortpiece);
            }
            continue;
        }

        //moves - conversion stops here
        if(/^(([0-9]+\..*)|([a-zA-Z]*-?[0-9]+,-?[0-9]+[^\|\.0-9]*(x|>)+.*))$/.test(string)){
            let shortmoves = (string + "  "+ shortformat).trimEnd();
            longformat["moves"] = [];

            shortmoves.replace(/[\!\?=]/g,"");
            while (shortmoves.indexOf("\{") > -1){
                let start_index = shortmoves.indexOf("\{");
                let end_index = shortmoves.indexOf("\}");
                if (end_index == -1){
                    console.error("Unclosed \{ found.");
                    return {};
                }
                shortmoves = shortmoves.slice(0,start_index) + shortmoves.slice(end_index+1);
            }
            shortmoves = shortmoves.match(/[a-zA-Z]*-?[0-9]+,-?[0-9]+[^\|\.0-9]*(x|>)+[^\|\.0-9]*-?[0-9]+,-?[0-9]+[^\|\.0-9]*/g);

            if (!shortmoves){
                delete longformat["moves"];
                return longformat;
            }
            if (!longformat["startingPosition"]){
                console.error("Moves but no starting position submitted!");
                delete longformat["moves"];
                return longformat;
            }

            let runningCoordinates = structuredClone(longformat["startingPosition"]);
            let runningRights = (longformat["specialRights"] ? structuredClone(longformat["specialRights"]) : {});
            let wasWhiteDoublePawnMove = false;
            let wasBlackDoublePawnMove = false;
            let pawnEndString;

            for (let i = 0; i < shortmoves.length; i++){
                let longmove = {};
                let coords = shortmoves[i].match(/-?[0-9]+,-?[0-9]+/g);
                let startString = coords[0];
                let startCoords = startString.split(",");
                startCoords[0] = parseInt(startCoords[0]);
                startCoords[1] = parseInt(startCoords[1]);
                let endString = coords[1];
                let endCoords = endString.split(",");
                endCoords[0] = parseInt(endCoords[0]);
                endCoords[1] = parseInt(endCoords[1]);

                let suffix_index = shortmoves[i].lastIndexOf(endString) + endString.length;
                let suffix = shortmoves[i].slice(suffix_index).trimStart().trimEnd();

                let isCheck = false;
                let isMate = false;
                if (suffix.match(/\+/g)){
                    isCheck = true;
                }
                if (suffix.match(/\#/g)){
                    isCheck = true;
                    isMate = true;
                }

                let isPromotion = false;
                suffix = suffix.replace(/(\+|\{.*\}|\(.*\))/g,""); // discard comments in (), {}
                let promotedPiece = ( /[a-zA-Z]/.test(suffix) ? suffix.match(/[a-zA-Z]/g).toString().replace(/[,\s]/g,"") : "");
                if (promotedPiece != ""){
                    isPromotion = true;
                    promotedPiece = ShortToLong_Piece(promotedPiece);
                }

                let movedPiece = structuredClone(runningCoordinates[startString]);
                delete runningCoordinates[startString];
                delete runningRights[startString];
                longmove["type"] = movedPiece;
                longmove["startCoords"] = startCoords;
                longmove["endCoords"] = endCoords;

                // capture and en passant handling
                if(runningCoordinates[endString]){
                    let capturedPiece = structuredClone(runningCoordinates[endString]);
                    delete runningCoordinates[endString];
                    delete runningRights[endString];
                    longmove["captured"] = capturedPiece;
                } else if (movedPiece.slice(0, -1) == "pawns" && startCoords[0] != endCoords[0] && startCoords[1] != endCoords[1]){
                    if (wasWhiteDoublePawnMove || wasBlackDoublePawnMove){
                        capturedPiece = structuredClone(runningCoordinates[pawnEndString]);
                        delete runningCoordinates[pawnEndString];
                        delete runningRights[pawnEndString];
                        longmove["captured"] = capturedPiece;
                        longmove["enpassant"] = (wasWhiteDoublePawnMove ? 1 : -1);
                    } else{
                        console.error("Error: En passant capture expected on move "+i+" but not possible.");
                        break;
                    }
                }

                // promotion handling
                if (isPromotion){
                    longmove["promotion"] = promotedPiece;
                    runningCoordinates[endString] = promotedPiece;
                } else{
                    runningCoordinates[endString] = movedPiece;
                }

                // detect if move is double pawn move, i.e. if it allows en passant next move
                if (movedPiece.slice(0, -1) == "pawns"){
                    if (startCoords[1] - endCoords[1] < -1){
                        wasWhiteDoublePawnMove = true;
                        wasBlackDoublePawnMove = false;
                        pawnEndString = structuredClone(endString);
                    } else if (startCoords[1] - endCoords[1] > 1){
                        wasWhiteDoublePawnMove = false;
                        wasBlackDoublePawnMove = true;
                        pawnEndString = structuredClone(endString);
                    } else{
                        wasWhiteDoublePawnMove = false;
                        wasBlackDoublePawnMove = false;
                    }
                }

                // castling handling
                if (movedPiece.slice(0, -1) == "kings"){
                    let xmove = endCoords[0] - startCoords[0];
                    if (xmove > 1 || xmove < -1){
                        let castle = {};
                        let castleCandidate = "";
                        for (let coordinate in runningRights){
                            let coordinateVec = coordinate.split(",");
                            coordinateVec[0] = parseInt(coordinateVec[0]);
                            coordinateVec[1] = parseInt(coordinateVec[1]);
                            if (runningRights[coordinate] && runningCoordinates[coordinate]){
                                if (coordinateVec[1] == startCoords[1]){
                                    if ((coordinateVec[0] > startCoords[0] && xmove > 1) || (coordinateVec[0] < startCoords[0] && xmove < 1)) {
                                        if (castleCandidate == ""){
                                            castleCandidate = coordinateVec;
                                        } else{
                                            if ((xmove > 1 && castleCandidate[0] > coordinateVec[0]) || (xmove < 1 && castleCandidate[1] < coordinateVec[0])){
                                                castleCandidate = coordinateVec;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (castleCandidate == ""){
                            console.error("Error: Castling failed on move "+i);
                            break;
                        }
                        castle["dir"] = (xmove > 1 ? 1 : -1);
                        castle["coord"] = castleCandidate;
                        longmove["castle"] = castle;
                        let castleString = castleCandidate[0].toString() + "," + castleCandidate[1].toString();
                        runningCoordinates[(parseInt(endCoords[0])-castle["dir"]).toString() + "," + endCoords[1].toString()] = structuredClone(runningCoordinates[castleString]);
                        delete runningCoordinates[castleString];
                        delete runningRights[castleString];
                    }
                }

                // check and mate
                if (isCheck){
                    longmove["check"] = true;
                    if (isMate){
                        longmove["mate"] = true;
                    }
                }
                
                longformat["moves"].push(longmove);
            }
            return longformat;
        }
    }
    return longformat;
}

/**
 * Converts a gamefile in JSON format to single position gamefile in JSON format with deleted "moves" object
 * @param {object} shortformatOG - Input gamefile in JSON format
 * @param {number} halfmoves - Number of halfmoves from starting position (Infinity: final position of game)
 * @returns {object} Output gamefile in JSON format
 */
function GameToPosition(longformat, halfmoves = 0){
    if(!longformat["moves"]){
        return longformat;
    }
    let ret = structuredClone(longformat);
    let enpassantcoordinates = (ret["enpassant"] ? ret["enpassant"] : "");
    for (let i = 0; i < Math.min(halfmoves, ret["moves"].length); i++){
        let move = ret["moves"][i];

        // update fullmove counter
        if (ret["turn"]){
            if (ret["turn"] == "black" && ret["fullMove"]){
                ret["fullMove"] += 1;
            }
            ret["turn"] = (ret["turn"] == "black" ? "white" : "black");
        } else if(move["type"].slice(-1) == "B" && ret["fullMove"]){
            ret["fullMove"] += 1;
        }

        let startString = move["startCoords"][0].toString() + "," + move["startCoords"][1].toString();
        let endString = move["endCoords"][0].toString() + "," + move["endCoords"][1].toString();

        // update coordinates in starting position
        if (move["promotion"]){
            ret["startingPosition"][endString] = structuredClone(move["promotion"]);
        } else{
            ret["startingPosition"][endString] = structuredClone(ret["startingPosition"][startString]);
        }
        delete ret["startingPosition"][startString];
        if (ret["specialRights"]){
            delete ret["specialRights"][startString];
            delete ret["specialRights"][endString];
        }

        // update move rule
        if (ret["moveRule"]){
            let slashindex = ret["moveRule"].indexOf("/");
            if(move["captured"] || move["type"].slice(0, -1) == "pawns"){
                ret["moveRule"] = "0/" + ret["moveRule"].slice(slashindex+1);
            } else{
                ret["moveRule"] = (parseInt(ret["moveRule"].slice(0,slashindex))+1).toString() + "/" + ret["moveRule"].slice(slashindex+1);
            }
        }

        // delete captured piece en passant
        if(move["enpassant"]){
            delete ret["startingPosition"][enpassantcoordinates];
            delete ret["specialRights"][enpassantcoordinates];
        }

        // update en passant
        if (move["type"].slice(0, -1) == "pawns" && Math.abs(move["startCoords"][1] - move["endCoords"][1]) > 1 ){
            ret["enpassant"] = move["endCoords"][0].toString() + "," + Math.round(0.5*(move["startCoords"][1] + move["endCoords"][1])).toString();
        } else{
            delete ret["enpassant"];
        }

        // update coords of castled piece
        if (move["castle"]){
            let castleString = move["castle"]["coord"][0].toString() + "," + move["castle"]["coord"][1].toString();
            ret["startingPosition"][(parseInt(move["endCoords"][0])-move["castle"]["dir"]).toString() + "," + move["endCoords"][1].toString()] = structuredClone(ret["startingPosition"][castleString]);
            delete ret["startingPosition"][castleString];
            if (ret["specialRights"]){
                delete ret["specialRights"][castleString];
            }
        }

        // save move coords for potential en passant
        enpassantcoordinates = endString;
    }
    delete ret["moves"];
    ret["moves"] = [];
    return ret;
}



// Example game converted from long to short format in three different levels of move compactness
gameExample = 
{"metadata":{"Variant":"Classical","Version":"1","White":"Tom","Black":"Ben","Clock":"10+5","Date":"2024/03/17 13:42:06","Result":"0-1","Condition":"checkmate"},"turn":"white","moveRule":"0/100","fullMove":1,"gameRules":{"slideLimit":"Infinity","promotionRanks":[8,1],"promotionsAllowed":{"white":["queens","rooks","bishops","knights"],"black":["queens","rooks","bishops","knights"]},"ovenTemperature": "350","winConditions":{"white":["checkmate"],"black":["checkmate"]}},"specialRights":{"1,2":true,"2,2":true,"3,2":true,"4,2":true,"5,2":true,"6,2":true,"7,2":true,"8,2":true,"1,7":true,"2,7":true,"3,7":true,"4,7":true,"5,7":true,"6,7":true,"7,7":true,"8,7":true,"1,1":true,"5,1":true,"8,1":true,"1,8":true,"5,8":true,"8,8":true},"startingPosition":{"1,2":"pawnsW","2,2":"pawnsW","3,2":"pawnsW","4,2":"pawnsW","5,2":"pawnsW","6,2":"pawnsW","7,2":"pawnsW","8,2":"pawnsW","1,7":"pawnsB","2,7":"pawnsB","3,7":"pawnsB","4,7":"pawnsB","5,7":"pawnsB","6,7":"pawnsB","7,7":"pawnsB","8,7":"pawnsB","1,1":"rooksW","8,1":"rooksW","1,8":"rooksB","8,8":"rooksB","2,1":"knightsW","7,1":"knightsW","2,8":"knightsB","7,8":"knightsB","3,1":"bishopsW","6,1":"bishopsW","3,8":"bishopsB","6,8":"bishopsB","4,1":"queensW","4,8":"queensB","5,1":"kingsW","5,8":"kingsB"},"moves":[{"type":"pawnsW","startCoords":[4,2],"endCoords":[4,4]},{"type":"pawnsB","startCoords":[4,7],"endCoords":[4,6]},{"type":"pawnsW","startCoords":[4,4],"endCoords":[4,5]},{"type":"pawnsB","startCoords":[3,7],"endCoords":[3,5]},{"type":"pawnsW","startCoords":[4,5],"endCoords":[3,6],"captured":"pawnsB","enpassant":-1},{"type":"bishopsB","startCoords":[6,8],"endCoords":[3,11]},{"type":"pawnsW","startCoords":[3,6],"endCoords":[2,7],"captured":"pawnsB"},{"type":"bishopsB","startCoords":[3,11],"endCoords":[-4,4]},{"type":"pawnsW","startCoords":[2,7],"endCoords":[1,8],"captured":"rooksB","promotion":"queensW"},{"type":"bishopsB","startCoords":[-4,4],"endCoords":[2,-2],"check":true},{"type":"kingsW","startCoords":[5,1],"endCoords":[4,2]},{"type":"knightsB","startCoords":[7,8],"endCoords":[6,6]},{"type":"queensW","startCoords":[1,8],"endCoords":[2,8],"captured":"knightsB"},{"type":"kingsB","startCoords":[5,8],"endCoords":[7,8],"castle":{"dir":1,"coord":[8,8]}},{"type":"queensW","startCoords":[2,8],"endCoords":[1,7],"captured":"pawnsB"},{"type":"queensB","startCoords":[4,8],"endCoords":[0,4]},{"type":"queensW","startCoords":[1,7],"endCoords":[7,13],"check":true},{"type":"kingsB","startCoords":[7,8],"endCoords":[8,8]},{"type":"queensW","startCoords":[7,13],"endCoords":[7,7],"captured":"pawnsB","check":true},{"type":"kingsB","startCoords":[8,8],"endCoords":[7,7],"captured":"queensW"},{"type":"pawnsW","startCoords":[8,2],"endCoords":[8,4]},{"type":"queensB","startCoords":[0,4],"endCoords":[4,4],"check":true,"mate":true}]}
let outputNice = LongToShort_Format(gameExample, compact_moves = 0, make_new_lines = true);
console.log("Game in short format with nice moves:\n\n" + outputNice + "\n");
let outputMoreCompact = LongToShort_Format(gameExample, compact_moves = 1, make_new_lines = true);
console.log("Game in short format with more compact moves:\n\n" + outputMoreCompact + "\n");
let outputMostCompact = LongToShort_Format(gameExample, compact_moves = 2, make_new_lines = true);
console.log("Game in short format with most compact moves:\n\n" + outputMostCompact + "\n");

// Converted back to long format
let gameExampleBackToLong = ShortToLong_Format(outputNice);
console.log("Converted back to long format:\n\n" + JSON.stringify(gameExampleBackToLong)+ "\n");

// Position after 21 halfmoves:
let position = GameToPosition(gameExample,21);
console.log("Position after 21 half moves in long format:\n\n" + JSON.stringify(position));
// console.log("Position after 21 half moves in short format:\n\n" + LongToShort_Format(position));


// String test:
// console.log(JSON.stringify(ShortToLong_Format(" 3,4  3 w 3232098/2319080123213 K3,3+ {asddssda: 2332} [asa: adsdsa] checkmate,asd")))