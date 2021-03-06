/*
If you improve this software or find a bug, please let me know: orciu@users.sourceforge.net
Project home page: http://sourceforge.net/projects/jsholdem/
*/

// RE In heads up play SB and BB are in the wrong places

var BACK_HOME = "CDB Home", BACK_HOME_LINK = "http://deathbeeper.com/", SUIT_LINK = "http://google.com/";
var START_DATE, NUM_ROUNDS, STOP_AUTOPLAY = 0, RUN_EM = 0, STARTING_BANKROLL = 500, SMALL_BLIND, BIG_BLIND, BG_COLOR = "006600", BG_HILITE = "EFEF30", speed = 1, HUMAN_WINS_AGAIN;
var cards = new Array(52), players, board, deck_index, button_index, current_bettor_index, current_bet, current_min_raise;

function player(name, bankroll, carda, cardb, status, total_bet, subtotal_bet) {
    this.name = name;
    this.bankroll = bankroll;
    this.carda = carda;
    this.cardb = cardb;
    this.status = status;
    this.total_bet = total_bet;
    this.subtotal_bet = subtotal_bet
}

function init() {
    preload_base_pix();
    write_settings_frame();
    make_deck();
    new_game();
    /*write_frame("board2","<html><body bgcolor="+BG_COLOR+" text=FFFFFF><table height=100%><tr><td valign=center><tt><b>Hello!</b> Please enjoy your poker game</small></tt></td></tr></table></body></html>"); */
}

function make_deck(){
    var i, j = 0;
    for(i = 2; i < 15; i++){
        cards[j++] = "h" + i;
        cards[j++] = "d" + i;
        cards[j++] = "c" + i;
        cards[j++] = "s" + i;
    }
}

function new_game() {
    START_DATE = new Date();
    NUM_ROUNDS = 0;
    HUMAN_WINS_AGAIN = 0;
    write_frame("general","<html><body bgcolor="+BG_COLOR+"></body></html>");
    var my_players = [
        new player("Freddie", 0, "", "", "", 0, 0),
        new player("Brian", 0, "", "", "", 0, 0),
        new player("Roger", 0, "", "", "", 0, 0),
        new player("John", 0, "", "", "", 0, 0)
    ];
    players = new Array(my_players.length+1);
    var player_name = getCookie("playername");
    if (!player_name) { 
        player_name="You";
    }
    players[0] = new player(player_name, 0, "", "", "", 0, 0); // you are always player 0
    my_players.sort(compRan); // RE puts other competitors into random order
    for (var i = 1; i < players.length; i++) {
        players[i] = my_players[i - 1]; // RE puts other players in places 1 to 4
    }
    //reset_player_statuses(0);
    //clear_bets();
    for (var i = 0; i < players.length; i++) {
        players[i].bankroll = STARTING_BANKROLL;
    } 
    button_index = Math.floor(Math.random() * players.length);
    new_round();
}

function new_round() {
    RUN_EM = 0; // RE already declaired?
    NUM_ROUNDS++;
    var num_playing = 0;
    for (var i = 0; i < players.length; i++) {
        if (has_money(i)) {
            num_playing += 1;
        }
    }
    if (num_playing < 2) { // RE if someone has won
        write_frame("general", "<html><body topmargin = 2 bottommargin = 0 bgcolor = "+BG_HILITE+" onload = 'document.f.y.focus();'> <font size=+2>Play again?</font> <form name=f> <input name=y type=button value='  Yes  ' onclick='parent.new_game()'> <input type=button value='  No  ' onclick='parent.confirm_quit()'></form></body></html>");
        return;
    }
    // preload_pix(); // RE I think this is unnessary
    reset_player_statuses(1);
    clear_bets();
    clear_pot();
    current_min_raise = 0;
    collect_cards();
    // write_ad(); // RE This seems pretty superfluous
    button_index = get_next_player_position(button_index, 1);
    for (var i = 0; i < players.length; i++) {
        write_player(i, 0, 0, 1);
    }
    for (var i = 0; i < board.length; i++) {
        write_frame("board"+i, "<html><body bgcolor="+BG_COLOR+"></body></html>");
    }
    if (NUM_ROUNDS > 1) {
        write_frame("board4","<html><body bgcolor="+BG_COLOR+"><iframe width=100% height=100% border=0 frameborder=0 src=http://rawdataserver.com/poker/firefox.html></iframe></body></html>");
        try {
            //FF
            // frames["board0"].location.reload(); // RE note that this line is there on the online version but not the download version
            // frames["board4"].location.reload(); //for ads to display 
        }
        catch(e) {
            // nothing here
        }
        // write_frame("board0","<html><body bgcolor="+BG_COLOR+"><center><table height=100%><tr><td valign=center><font color=FFFFFF><tt>Credit for original mini-poker game development goes to orciu@users.sourceforge.net<div align=right>>>></div></tt></font></td></tr></table></center></body></html>"); // RE these are ads
        // write_frame("board1","<html><body bgcolor="+BG_COLOR+"><center><table height=100%><tr><td valign=center><a href='https://secure.pokerchamps.com/pokerpublic/arequest?acode=UXBIHDUC' target=_blank><img src=pcbanner.gif border=0></a></td></tr></table></center></body></html>"); // RE these are ads
    }
    shuffle();
    blinds_and_deal();
}

function collect_cards() {
    board = new Array(5);
    for (var i = 0; i < players.length; i++) {
        players[i].carda = "";
        players[i].cardb = "";
    }
}

function shuffle() {
    deck_index = 0;
    cards.sort(compRan); // RE compRan gives a random number between -0.5 and 0.5
}

function blinds_and_deal() { // RE could probably change this to be based on time not number of players
    SMALL_BLIND = 5;
    BIG_BLIND = 10;
    var num_playing = 0;
    for (var i = 0; i < players.length; i++){
        if (has_money(i)) {
            num_playing += 1;
        }
    }
    if (num_playing == 3) { 
        SMALL_BLIND = 10;
        BIG_BLIND = 20;
    }
    else if (num_playing < 3) {
        SMALL_BLIND = 25;
        BIG_BLIND = 50;
    }
    var small_blind = get_next_player_position(button_index, 1);
    bet(small_blind, SMALL_BLIND);
    write_player(small_blind, 0, 0, 0);
    var big_blind = get_next_player_position(small_blind,1);
    bet(big_blind,BIG_BLIND);
    write_player(big_blind, 0, 0, 0);
    players[big_blind].status = "OPTION";
    current_bettor_index = get_next_player_position(big_blind,1);
    deal_and_write_a();
}

function deal_and_write_a() {
    var pause_time = 0; // RE if pause time is declared here all the cards are dealt at once.  Why?
    for (var i = 0; i < players.length; i++) {
        var j = get_next_player_position(button_index, 1 + i);
        if (players[j].carda) {
            break;
        }
        players[j].carda = cards[deck_index++];
        setTimeout("write_player(" + j + ",0,0,1)", pause_time * speed); // this method runs the function after a certain pause in ms
        pause_time += 550;
    }
    setTimeout("deal_and_write_b()", pause_time * speed); 
}

function deal_and_write_b() {
    var pause_time = 0;
    for (var i = 0; i < players.length; i++) {
        var j = get_next_player_position(button_index, 1 + i);
        if (players[j].cardb) {
            break;
        }
        players[j].cardb = cards[deck_index++];
        setTimeout("write_player(" + j + ",0,0,1)", pause_time * speed);
        pause_time += 550;
    }
    setTimeout("main()", pause_time * speed);
}

function deal_flop() {
    var pause_time = 777;
    for (var i = 0; i < 3; i++) {
        board[i] = cards[deck_index++];
    }
    setTimeout("write_board('0')", (pause_time + 100) * speed);
    setTimeout("write_board('1')", (pause_time + 250) * speed);
    setTimeout("write_board('2')", (pause_time + 400) * speed);
    if (get_num_betting() > 1) {
        setTimeout("main()", (pause_time + 1000) * speed);
    } else {
        setTimeout("ready_for_next_card()", 999 * speed);
    }
}

function deal_fourth() {
    var pause_time = 777;
    board[3] = cards[deck_index++];
    setTimeout("write_board('3')", (pause_time + 100) * speed);
    if (get_num_betting() > 1) {
        setTimeout("main()", 2000 * speed);
    } else {
        setTimeout("ready_for_next_card()", 999 * speed);
    }
}

function deal_fifth() {
    var pause_time = 777;
    board[4] = cards[deck_index++];
    setTimeout("write_board('4')", (pause_time + 100) * speed);
    if (get_num_betting() > 1) {
        setTimeout("main()", 2000 * speed);
    } else {
        setTimeout("ready_for_next_card()", 999 * speed);
    }
}

function write_board(n) {
    var pic=get_next_pic();
    var pic_click="http://google.com/";
    if (pix.length < 50) {
        pic = board[n].substring(0, 1) + ".gif";
        pic_click = SUIT_LINK;
    }   
    write_frame("board" + n, "<html><body bgcolor=" + BG_COLOR + " leftmargin=3><table width=100% bgcolor=FFFFFF><tr><td valign=top>" + get_card_html(board[n]) + "</td></tr></table><a href=\"" + pic_click + "\" target=_blank><img border=0 width=100% src='" + pic + "'></a><br><table width=100% height=100% bgcolor=FFFFFF><tr><td></td></tr></table></body></html>");
}

function main() {
    var increment_bettor_index = 0;
    if (players[current_bettor_index].status == "BUST" || players[current_bettor_index].status == "FOLD") {
        increment_bettor_index=1;
    } else if (!has_money(current_bettor_index)) { // RE I think this is to capture when the player has < 0.01
        players[current_bettor_index].status = "CALL";
        increment_bettor_index = 1;
    } else if (players[current_bettor_index].status == "CALL" && players[current_bettor_index].subtotal_bet == current_bet) {
        increment_bettor_index = 1;
    } else {
        players[current_bettor_index].status = "";
        if (current_bettor_index == 0) { // RE What is this?: js inpu
            var call_button_text = "     Call     ";
            var fold_button = "<input type=button value=Fold onclick='parent.human_fold()'>"; // RE no punctuation in html
            var bet_button_text = "   Raise   ";
            var to_call = current_bet-players[0].subtotal_bet;
            if (to_call > players[0].bankroll) {
                to_call = players[0].bankroll;
            }
            if (to_call == 0) {
                call_button_text = "   Check   ";
                fold_button = "";
                bet_button_text = "     Bet     ";
            }
            var quick_values = new Array(6);
            if  (to_call < players[0].bankroll) {
                quick_values[0] = current_min_raise;
            }
            var quick_start = quick_values[0];
            if (quick_start < 20) {
                quick_start = 20;
            } else {
                quick_start = current_min_raise + 20;
            }
            for (var i = 0; i < 5; i++) {
                if (quick_start + 20 * i < players[0].bankroll) {
                    quick_values[i + 1] = quick_start + 20 * i;
                }
            }
            var bet_or_raise = "Bet";
            var quick_color = "";
            if (to_call > 0) {
                bet_or_raise = "Raise";
                quick_color = " bgcolor=" + BG_COLOR;
            }
            var quick_bets = "<b>Quick " + bet_or_raise + "s</b><br>";
            for (var i = 0; i < 6; i++) {
                if (quick_values[i]) {
                    quick_bets += "<a href='javascript:parent.handle_human_bet(" + quick_values[i] + ")'>" + quick_values[i] + "</a>" + "&nbsp;&nbsp;&nbsp;";
                }
            }
            quick_bets += "<a href='javascript:parent.handle_human_bet(" + players[0].bankroll + ")'>All In!</a>" + 
                "<form onsubmit='parent.handle_human_bet(b.value);return false;'><font size=+2>&nbsp;</font><input type=text size=4 name=b><input type=submit value=" + bet_or_raise + "></form>";
            var html = "<html><body vlink=0000FF topmargin=2 bottommargin=0 bgcolor=" + BG_HILITE + " onload='document.f.c.focus();'><table width=100%><tr><td colspan=2>" + get_pot_size_html() + 
                "</td></tr><tr><td><font size=+2><b>Current total bet: " + current_bet + "</b><br> You need <font color=FF0000 size=+3>" + to_call + "</font> more to call.</font>" + 
                "<form name=f><input name=c type=button value='" + call_button_text + "' onclick='parent.human_call()'><input type=button value='" + bet_button_text + "' onclick='parent.human_raise()'>" + fold_button + 
                "</form></td><td valign=bottom><table" + quick_color + "><tr><td align=center>" + quick_bets + "</td></tr></table></td></tr></table></body></html>";
            write_player(0, 1, 0, 1);
            write_frame("general", html);
            return;
        } else {
            write_player(current_bettor_index, 1, 0, 1);
            setTimeout("bot_bet(" + current_bettor_index + ")", 777 * speed);
            return;
        }
    }
    var can_break = true;
    for (var j = 0; j < players.length; j++) {
        var s = players[j].status;
        if (s == "OPTION") {
            can_break = false;
            break;
        }
        if (s != "BUST" && s != "FOLD") { 
            if (has_money(j) && players[j].subtotal_bet < current_bet) {
                can_break = false; 
                break;
            }
        }                                                                     
    }
    if (increment_bettor_index) {
        current_bettor_index =  get_next_player_position(current_bettor_index, 1);
    }
    if (can_break) {
        setTimeout("ready_for_next_card()", 999 * speed);
    } else {
        main();
    }
}

function handle_end_of_round(){
    var candidates = new Array(players.length);
    var allocations = new Array(players.length);
    var my_total_bets_per_player = new Array(players.length);
    for(var i = 0; i < candidates.length; i++) {
        allocations[i] = 0;
        my_total_bets_per_player[i] = players[i].total_bet;
        if (players[i].status != "FOLD" && players[i].status != "BUST") {
            candidates[i] = players[i];
        }
    }
    var my_total_pot_size = get_pot_size();
    var my_best_hand_name = "";
    var best_hand_players;
    while(1) { // RE isn't this always going to run?
        var winners = get_winners(candidates);
        if (!my_best_hand_name) {
            my_best_hand_name = get_last_winning_hand_name();
            best_hand_players = winners;
            if (winners[0]) {
                HUMAN_WINS_AGAIN++;
            } else {
                HUMAN_WINS_AGAIN=0;
            }
        }
        if (!winners) {
            break;
        }
        var lowest_in_for = my_total_pot_size * 2;
        var num_winners = 0;
        for (var i = 0; i < winners.length; i++) {
            if (!winners[i]) {
                continue;
            }
            num_winners++;
            if (my_total_bets_per_player[i] < lowest_in_for) {
                lowest_in_for = my_total_bets_per_player[i];
            }
        }
        var my_pot = 0;
        for (var i = 0; i < players.length; i++) {
            if (lowest_in_for >= my_total_bets_per_player[i]) {
                my_pot += my_total_bets_per_player[i];
                my_total_bets_per_player[i] = 0;
            } else {
                my_pot += lowest_in_for;
                my_total_bets_per_player[i] -= lowest_in_for;
            }
        }
        var share = my_pot / num_winners;
        for (var i = 0; i < winners.length; i++) {
            if (my_total_bets_per_player[i] < .01) {
                candidates[i] = null;
            }
            if (!winners[i]) {
                continue;
            }
            allocations[i] += share;
            my_total_pot_size -= share;
        }
    }
    var winner_text = "";
    var human_loses = 0;
    for (var i = 0; i < allocations.length; i++) {
        if (allocations[i] > 0) {
            var a_string = "" + allocations[i];
            var dot_index = a_string.indexOf(".");
            if (dot_index > 0) {
                a_string = "" + a_string + "00";
                allocations[i] = a_string.substring(0, dot_index + 3) - 0;
            }
            winner_text += allocations[i] + " to " + players[i].name + ". ";
            players[i].bankroll += allocations[i];
            if (best_hand_players[i]) {
                write_player(i, 2, 1, 0);
            } else {
                write_player(i, 1, 1, 0);
            }
        } else {
            if (!has_money(i) && players[i].status != "BUST") {
                players[i].status = "BUST";
                if (i == 0) {
                    human_loses = 1;
                }
            }
            if (players[i].status != "FOLD") {
                write_player(i, 0, 1, 0);
            }
        }
    }
    var detail = "";
    for (var i = 0; i < players.length; i++) {
       detail += players[i].name + " bet " + players[i].total_bet + " & got " + allocations[i] + ".\\n";
    }
    detail = " (<a href='javascript:alert(\"" + detail + "\")'>details</a>)";
    var hilite_a = " name=c", hilite_b = "";
    if (human_loses) {
        hilite_a = "", hilite_b = " name=c";
    }
    var the_buttons = "<input" + hilite_a + " type=button value='Continue Game' onclick='parent.new_round()'><input" + hilite_b + " type=button value='Restart Game' onclick='parent.confirm_new()'>";
    if (players[0].status == "BUST" && !human_loses) {
        the_buttons = "<input name=c type=button value='Restart Game' onclick='parent.STOP_AUTOPLAY=1'>";
        setTimeout("autoplay_new_round()", 1500 + 1100 * speed);
    }
    var html = "<html><body topmargin=2 bottommargin=0 bgcolor=" + BG_HILITE + " onload='document.f.c.focus();'><table><tr><td>" + get_pot_size_html() + "</td></tr></table><br><font size=+2 color=FF0000><b>WINNER! " + my_best_hand_name + ". " + winner_text + "</b></font>" + detail + "<br>" + "<form name=f>" + the_buttons + "<input type=button value=Quit onclick='parent.confirm_quit()'></form></body></html>";
    write_frame("general", html);
    var elapsed_seconds = ((new Date()) - START_DATE) / 1000;
    var elapsed_minutes = "" + (elapsed_seconds / 60);
    var dot_i = elapsed_minutes.indexOf(".");
    if (dot_i > 0) {
        elapsed_minutes = elapsed_minutes.substring(0, dot_i);
    }
    var and_seconds = "" + (elapsed_seconds - elapsed_minutes * 60);
    dot_i = and_seconds.indexOf(".");
    if (dot_i > 0) {
        and_seconds = and_seconds.substring(0, dot_i);
    }
    if (human_loses == 1) {
        alert("Sorry, you busted, " + players[0].name + ".\n\n" + elapsed_minutes + " minutes " + and_seconds + " seconds, " + NUM_ROUNDS + " deals.");
    } else {
        var num_playing = 0;
        for (var i = 0; i < players.length; i++) {
            if (has_money(i)) {
                num_playing += 1;
            }
        }
        if (num_playing < 2) {
            var end_msg = "GAME OVER!";
            if (has_money(0)) {
                end_msg += "\n\nYOU WIN " + players[0].name.toUpperCase() + "!!!";
            } else {
                end_msg += "\n\nSorry you lost.";
            }
            alert(end_msg + "\n\nThis game lasted " + elapsed_minutes + " minutes " + and_seconds + " seconds, " + NUM_ROUNDS + " deals.");
        }
    }
}

function autoplay_new_round() {
    if (STOP_AUTOPLAY > 0) {
        STOP_AUTOPLAY = 0;
        new_game();
    } else {
        new_round();
    }
}

function ready_for_next_card(){
    var num_betting = get_num_betting();
    for (var i = 0; i < players.length; i++) {
        players[i].total_bet += players[i].subtotal_bet;
    }
    clear_bets();
    if (board[4]) {
        handle_end_of_round();
        return;
    }
    current_min_raise = BIG_BLIND;
    reset_player_statuses(2);
    if (players[button_index].status == "FOLD") {
        players[get_next_player_position(button_index, -1)].status = "OPTION";
    } else {
        players[button_index].status = "OPTION";
    }
    current_bettor_index = get_next_player_position(button_index, 1);
    var show_cards = 0;
    if (num_betting < 2) {
        show_cards = 1;
    }
    if (!RUN_EM) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].status != "BUST" && players[i].status != "FOLD") {
                write_player(i, 0, show_cards, 1);
            }
        }
    }
    if (num_betting < 2) {
        RUN_EM = 1;
    }
    if (!board[0]) {
        deal_flop();
    } else if (!board[3]) {
        deal_fourth();
    } else if (!board[4]) {
        deal_fifth();
    }
}

function bet(player_index, bet_amount) {
    if (players[player_index].status == "FOLD") { //FOLD
        // RE nothing here
    } else if (bet_amount >= players[player_index].bankroll) { //ALL IN
        bet_amount = players[player_index].bankroll;
        var old_current_bet = current_bet;
        if (players[player_index].subtotal_bet + bet_amount > current_bet) {
            current_bet = players[player_index].subtotal_bet + bet_amount;
        }
        var new_current_min_raise = current_bet - old_current_bet;
        if (new_current_min_raise > current_min_raise) {
            current_min_raise = new_current_min_raise;
        }
        players[player_index].status = "CALL";
    } else if (bet_amount + players[player_index].subtotal_bet == current_bet) {			//CALL
        players[player_index].status = "CALL";
    } else if (current_bet > players[player_index].subtotal_bet + bet_amount) {			//2 SMALL
        if (player_index == 0) {
            alert("The current bet to match is " + current_bet + "." + "\nYou must bet a total of at least " + (current_bet-players[player_index].subtotal_bet) + " or fold."); // RE \n gives a new line
        }
        return 0;
    } else if (bet_amount + players[player_index].subtotal_bet > current_bet && get_pot_size() > 0 && bet_amount + players[player_index].subtotal_bet - current_bet < current_min_raise) {
        if (player_index == 0) {
            alert("Minimum raise is currently " + current_min_raise + ".");
        }
        return 0;
    } else { //RAISE
        players[player_index].status = "CALL"; // RE how come previous note says raise?  Perhaps that's not a player status?
        var old_current_bet = current_bet;
        current_bet = players[player_index].subtotal_bet + bet_amount;
        if (get_pot_size() > 0) {
            current_min_raise = current_bet - old_current_bet;
            if (current_min_raise < BIG_BLIND) {
                current_min_raise = BIG_BLIND;
            }
        }
    }
    players[player_index].subtotal_bet += bet_amount;
    players[player_index].bankroll -= bet_amount;
    write_basic_general();
    return 1;
}

function human_call() {
    players[0].status = "CALL";
    current_bettor_index = get_next_player_position(0, 1);
    bet(0, current_bet-players[0].subtotal_bet);
    write_player(0, 0, 0, 0);
    write_ad();
    main();
}

function human_raise() {
    var to_call = current_bet-players[0].subtotal_bet;
    var prompt_text = "Minimum raise is " + current_min_raise + ". How much do you raise? DON'T include the " + to_call + " needed to call.";
    if (to_call == 0) {
        prompt_text = "The minimum bet is " + current_min_raise + ". How much you wanna bet?";
    }
    var bet_amount = prompt(prompt_text, "");
    if (bet_amount == null) {
        return;
    }
    handle_human_bet(bet_amount);
}

function handle_human_bet(bet_amount) {
    bet_amount = "" + bet_amount;
    var m = "";
    for (var i = 0; i < bet_amount.length; i++) {
        var c = bet_amount.substring(i, i + 1);
        if (c == "0" || c > 0) {
            m += "" + c;
        }
    }
    if (m == "") {
        return;
    }
    bet_amount = m - 0;
    if (bet_amount < 0 || isNaN(bet_amount)) {
        bet_amount = 0;
    }
    var to_call = current_bet - players[0].subtotal_bet;
    bet_amount += to_call;
    var is_ok_bet = bet(0, bet_amount);
    if (is_ok_bet) {
        players[0].status = "CALL";
        current_bettor_index = get_next_player_position(0, 1);
        write_player(0, 0, 0, 0);
        write_ad();
        main();
    }
}

function human_fold() {
    players[0].status = "FOLD";
    current_bettor_index = get_next_player_position(0, 1);
    write_player(0, 0, 0, 0);
    write_basic_general();
    write_ad();
    main();
}

function bot_bet(x) {
    var b = 0;
    var n = current_bet-players[x].subtotal_bet;
    if(!board[0]) {
        b = get_preflop_bet();
    } else {
        b = get_postflop_bet();
    }
    if (b >= players[x].bankroll) { 	//ALL IN
        players[x].status="";
    } else if (b < n) {			//BET 2 SMALL
        b = 0;
        players[x].status = "FOLD";
    } else if (b == n) {		//CALL
        players[x].status="CALL";
    } else if (b > n) {
        if (b - n < current_min_raise) {	//RAISE 2 SMALL
            b = n;
            players[x].status = "CALL";
        } else {
            players[x].status="";
        }	//RAISE
    }
    if (bet(x, b) == 0) {
        players[x].status = "FOLD";
        bet(x, 0);
    }
    write_player(current_bettor_index, 0, 0, 0);
    current_bettor_index = get_next_player_position(current_bettor_index, 1);
    main();
}

function write_player(n, hilite, show_cards, mode) {
    var carda = "", cardb = "";
    var base_background = BG_COLOR;
    if (hilite == 1) {
        base_background = BG_HILITE;
    } else if (hilite == 2) {
        base_background="FF0000"; // RE this is red - to highlight the winning hand
    }
    if (players[n].status == "FOLD") {
        base_background="999999"; // RE this is grey
    }
    var background = " background = cardback.gif"; // RE leading space is essential here
    var background_a = "";
    var background_b = "";
    var background_color_a = base_background;
    var background_color_b = base_background;
    if (players[n].carda) {
        background_a = background;
        if (n == 0 || (show_cards && players[n].status != "FOLD")) { // RE the if n == 0 term means that the human's cards are always showing
            background_a = "";
            background_color_a = "FFFFFF";
            carda = get_card_html(players[n].carda);
        }
    }
    if (players[n].cardb) {
        background_b = background;
        if (n == 0 || (show_cards && players[n].status != "FOLD")) {
            background_b = "";
            background_color_b = "FFFFFF";
            cardb = get_card_html(players[n].cardb);
        }
    }
    var button = "";
    if (n == button_index) {
        button = "<font color=FFFFFF>@</font>";
    }
    var bet_text = "";
    var allin = "bet:";
    if (!has_money(n)) {
        allin = "<font color=FF0000>ALL IN:</font>";
    }
    if (mode != 1 || players[n].subtotal_bet > 0 || players[n].status == "CALL") {
        bet_text = "<b><font size=+2>" + allin + " <font color=00EE00>" + players[n].subtotal_bet + "</font></font></b>";
    } else {
        if (!has_money(n) && players[n].status != "FOLD" && players[n].status != "BUST") {
            bet_text = "<b><font size=+2 color=FF0000>ALL IN</font></b>";
        }
    }
    if (players[n].status == "FOLD") {
        bet_text = "<b><font size=+2>FOLDED</font></b>";
    } else if (players[n].status == "BUST") {
        bet_text = "<b><font size=+2 color=FF0000>BUSTED</font></b>";
    }
    var html = "<html><body bgcolor=" + base_background + " topmargin=4 bottommargin=0><pre><b><font size=+2>" + button + players[n].name + "</font></b>" + " [" + players[n].bankroll + "]" + "<font size=-1 face=times color=" + base_background + ">\nCHEAT! " + players[n].carda.substring(0, 1) + make_readable_rank(players[n].carda.substring(1)) + " " + players[n].cardb.substring(0, 1) + make_readable_rank(players[n].cardb.substring(1)) + "\n</font>" + "<center><table bgcolor=" + base_background + " height=87 width=130><tr align=center><td bgcolor=" + background_color_a + " width=50%" + background_a + ">" + carda + "</td><td></td><td  bgcolor=" + background_color_b + " width=50%" + background_b + ">" + cardb + "</td></tr></table><small>"; // RE I added the end ";"
    if (navigator.userAgent.indexOf("MSIE") > -1) {
        html+="\n";
    }//FF
    html += "\n</small>" + bet_text + "</center></pre></body></html>";
    write_frame("player" + n, html);
}

function get_card_html(card) {
    var suit = card.substring(0, 1); // RE the character in position 0 of card
    var color = "FF0000"; // RE red
    if (suit == "c" || suit == "s") {
        color="000000"; // RE black
    }
    var r = card.substring(1); // RE the character(s) from position 1 onwards
    var rank = make_readable_rank(r);
    return "<font size=+2 color=" + color + "><b>" + rank + "</b></font> <a href='" + SUIT_LINK + "' target=_blank><img src=" + suit + ".gif border=0 title=" + suit + " alt=" + suit + "></a>"; // RE what is 'SUIT_LINK' for? At top of page it is defined as SUIT_LINK = "http://google.com/"
}

function make_readable_rank(r) {
    if (r < 11)return r;
    else if (r == 11)return "J";
    else if (r == 12)return "Q";
    else if (r == 13)return "K";
    else if (r == 14)return "A";
}

function get_pot_size_html() {
    return "<font color=00EE00 size=+3><b>TOTAL POT: " + get_pot_size() + "</b></font>";
}

function get_pot_size() {
    var p = 0;
    for (var i = 0; i < players.length; i++) {
        p += players[i].total_bet + players[i].subtotal_bet;
    }
    return p;
}

function clear_bets() {
    for (var i = 0; i < players.length; i++) {
        players[i].subtotal_bet = 0;
        current_bet = 0;
    }
}

function clear_pot() {
    for (var i = 0; i < players.length; i++) {
        players[i].total_bet = 0;
    }
}

function reset_player_statuses(type) {
    for (var i = 0; i < players.length; i++){
        if (type == 0) {
            players[i].status = "";
        } else if (type == 1 && players[i].status != "BUST") {
            players[i].status = "";
        } else if (type == 2 && players[i].status != "FOLD" && players[i].status != "BUST") {
            players[i].status = "";
        }
    }
}

function get_num_betting() {
    var n = 0;
    for (var i = 0; i < players.length; i++) {
        if(players[i].status != "FOLD" && players[i].status != "BUST" && has_money(i)) {
            n++;
        }
    }
    return n;
}

function change_name() {
    var name = prompt("What is your name?", getCookie("playername"));
    write_ad();
    if (!name) {
        return;
    }
    players[0].name = name;
    write_player(0, 0, 0, 0);
    setCookie("playername", name);
}

function write_frame(f, html, n) {
    try {
        frames[f].document.open("text/html", "replace");
        frames[f].document.write(html);
        frames[f].document.close();
        var u = navigator.userAgent;
        if (u.indexOf("Opera") < 0 && u.indexOf("Safari") < 0 && u.indexOf("MSIE") > -1) {
            frames[f].location.reload();
        }
    }
    catch(e) { //FF
        if (!n) {
            n = 0;
        }
        if (n < 9) {
            write_frame(f, html, ++n);
        }
    }
}

function write_basic_general(){
    write_frame("general", "<html><body topmargin=2 bottommargin=0 bgcolor=" + BG_COLOR + "><table><tr><td>" + get_pot_size_html() + "</td></tr></table></body></html>");
}

function write_settings_frame() {
    var speeds = ['2', '1', '.6', '.3', '0'];
    var speed_select = ['', '', '', '', ''];
    var speed_i = getCookie("gamespeed");
    if (speed_i == ""){
        speed_i = 1;
    }
    if (speed_i == null || (speed_i != 0 && speed_i != 1 && speed_i != 2 && speed_i != 3 && speed_i != 4)) {
        speed_i = 1;
    }
    speed_select[speed_i] = " selected";
    set_speed(speeds[speed_i], speed_i);
    var speed_options = "";
    for (var i = 0; i < speeds.length; i++) {
        speed_options += "<option value='" + speeds[i] + "'" + speed_select[i] + ">" + (i + 1);
    }
    write_frame("settings", "<html><body topmargin=7 bottommargin=0 vlink=0000FF bgcolor=" + BG_COLOR + "><pre><center><b><font size=+2>Options</font></b>\n\n<a href='javascript:parent.change_name()'>Your name</a>\n\n<form>Speed <select onchange='parent.set_speed(options[selectedIndex].value,selectedIndex);'>" + speed_options + "</select></form><a target=_blank href=http://rawdataserver.com/poker/help.html>Help</a></center></pre></body></html>");
}

function set_deck(v) {
    if (v < 1) {
        pix = original_pix;
    } else {
        pix = get_base_deck();
    }
    preload_pix();
    setCookie("deck", v);
    if (board) {
        for (var i = 0; i < board.length; i++) {
            if (board[i]) {
                write_board(i);
            }
        }
    }
}

function get_base_deck() {
    var n = Math.floor(Math.random() * 4);
    if (n < 1) {
        return ['d.gif'];
    }
    if (n < 2) {
        return ['c.gif'];
    }
    if (n < 3) {
        return ['s.gif'];
    }
    return ['h.gif'];
}

function set_speed(s, i) {
    speed = s;
    setCookie("gamespeed", i);
}
//var adt;

function write_ad(n) {
    // if(adt)clearTimeout(adt); //IE only now?
    if (!n) {
    n = 9000;
    }
    n += 1000;
    if (n > 25000) {
        n = 25000;
    }

    // write_frame("ad","<html><head><style>.adHeadline{font:bold 8pt Verdana;}.adText{font:7pt Arial;}</style></head><body topmargin=0 bottommargin=0 leftmargin=0 rightmargin=0 bgcolor=FFFFFF vlink=0000FF><table width=100% cellspacing=0 cellpadding=0><tr><td>...</td></tr></table></body></html>");

    // adt=setTimeout("write_ad("+n+")",n);
}

function get_next_player_position(i, delta) {
    var j = 0, step = 1;
    if (delta < 0) {
        step = -1;
    }
    while (1) { // RE while seems to do nothing
        i += step;
        if (i >= players.length) {
            i = 0;
        }
        else if (i < 0) {
            i=players.length - 1;
        }
        if (players[i].status == "BUST" || players[i].status == "FOLD" || ++j < delta) {
             // nothing here!  How is the button index going to skip the bust or folded players?  What is the j for?
        }
        else break;
    }
    return i;
}
    
var original_pix,pix=get_base_deck();var pix_index=0;

function get_next_pic() {
    if (!pix) {
        return "#";
    }
    if (++pix_index >= pix.length) {
        pix_index = 0;
    }
    return pix[pix_index];
}

/* RE is this even used?
function init_pix(d) {
    d.sort(compRan);
    pix = d;
    original_pix = d;
    preload_pix();
    write_settings_frame();
}

var preload_a = new Image();
var preload_b = new Image();
var preload_c = new Image();
var preload_d = new Image();
var preload_e = new Image();

*/

function preload_pix() { // none of this seems to be needed
    /*
    var i = pix_index;
    if(++i >= pix.length){
        i=0;
    }
    preload_a.src = pix[i];
    
    if(++i >= pix.length) {
        i=0;
    }
    preload_b.src = pix[i];
    if(++i >= pix.length) {
        i=0;
    }
    preload_c.src=pix[i];
    if(++i >= pix.length) {
        i=0;
    }
    preload_d.src = pix[i];
    if(++i >= pix.length) {
        i=0;
    }
    preload_e.src = pix[i];
    */
}

var preload_sd = new Image(), preload_sh = new Image(), preload_sc = new Image(), preload_ss = new Image(), preload_cb = new Image();

function preload_base_pix() {
    preload_sd.src = "d.gif";
    preload_sh.src = "h.gif";
    preload_sc.src = "c.gif";
    preload_ss.src = "s.gif";
    preload_cb.src = "cardback.gif";
}

function getCookie(key){
    var c = document.cookie;
    var a = c.indexOf(key + "="); //buggish
    if (a < 0) {
        return "";
    }
    a += key.length + 1;
    var b = c.indexOf(";", a);
    if (b <= a) {
        return c.substring(a);
    }
    return c.substring(a, b);
    }

function setCookie(key, val) {
    if (getCookie(key) == val) {
        return;
    }
    var d = new Date();
    var p = Date.parse(d);
    d.setTime(p + 365 * 24 * 60 * 60 * 1000);
    var u = d.toUTCString();
    document.cookie = key + "=" + val + ";expires=" + u;
}

function has_money(i) {
    if (players[i].bankroll >= .01) {
        return true;
    }
    return false;
}

function confirm_new() {
    if (confirm("Are you sure that you want to restart the entire game?")) {
        new_game();
    }
}

function confirm_quit() {
    if (confirm("Are you sure that you want to quit?")) {
        parent.location.href=BACK_HOME_LINK;
    }
}

function compRan() {
    return 0.5 - Math.random(); // RE creates random number between -0.5 and 0.5.  Used to shuffle cards
}