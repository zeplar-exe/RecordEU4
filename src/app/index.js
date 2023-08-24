async function replay_selected(replay) {
    $("#initialize-screen").css("display", "none")

    eel.get_replay_bitmap(replay)
}