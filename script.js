console.log("write the js code")
let currentsong = new Audio(); //global variable single variable for all sogns
let songs=[];
let currFolder
let currentIndex=0;

async function getsongs(folder) {
    currentIndex=0;
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3"))
            songs.push(element.href.split(`/${folder}/`)[1])
    }
    
    //place the songs on library
    let songUL = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        cursong = song.replaceAll("%20", " ");
        songkaname = cursong.split("-")[0];
        songkaartist = cursong.split("-")[1];
        if (songkaartist == undefined) songkaartist = "NotKnown";

        songUL.innerHTML = songUL.innerHTML + `<li>
                                <img src="img/music.svg" alt="" srcset="">
                                <div class="info">
                                    <div class="songname">${cursong}</div>
                                </div>
                                <div class="playnow"> 
                                    <span>Play Now</span>
                                    <img class="invert" src="img/playbar-play.svg" alt="" srcset="">
                                </div>
                            </li>`;
    }

    // Attach an event listenet to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector('.info').firstElementChild.innerHTML)
            playMusic(e.querySelector('.info').firstElementChild.innerHTML);
        })
    })
    return songs;

}

//chotu funciton


function secondsToMinutesSeconds(seconds) {
    seconds = Math.floor(seconds);

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format with leading zero if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine and return
    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, paused = false) => {
    // let audio=new Audio("/songs/"+track)
    currentsong.src = `/${currFolder}/` + track
    if (paused == false) {

        currentsong.play();
        play.src = "img/playbar-pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    // console.log(e.href)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1);
            //get the meta fdata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <img src="img/playbar-play.svg" alt="" srcset="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //load the libreary whenever a card is clickeds;s
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log("a rha")
            // console.log(item, item.currentTarget.dataset);
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            currentIndex=0;      
            playMusic(songs[currentIndex]);      
        })
    })
}

async function main() {
    await getsongs("songs/ncs")
    playMusic(songs[0], true)


    //play all the albums on the page

    displayAlbums();



    //attach an event listner to the play ad paused

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/playbar-pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/playbar-play.svg"
        }
    })

    //listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime * 100 / currentsong.duration) + "%"
    })

    //add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect().width,e.offsetX)
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    })

    // add an event listern for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add event listenre to previous and next
    
    currentIndex = songs.indexOf(currentsong.src.split("/songs/")[1]);
    previous.addEventListener("click", () => {
        if(songs.length===0) return;
        if (currentIndex === 0) {
            currentIndex = songs.length - 1;
            // alert("You have reached start of playlist")
        }
        else currentIndex=currentIndex-1;
        playMusic(songs[currentIndex]);
    })
    next.addEventListener("click", () => {
        if(songs.length===0) return;
        if (currentIndex == songs.length - 1) {
            currentIndex = 0;
            // alert("You have reached end of playlist")
        }
        else currentIndex=currentIndex+1;
        playMusic(songs[currentIndex]);
    })

    // add an event listener to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
       
    })

    
    // Attach event listener to the image for mute/unmute
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        console.log(e.target.src)
        if(e.target.src.includes("volume.svg"))
        {
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else {
            e.target.src=e.target.src.replace("mute.svg","volume.svg");
            currentsong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
        
    })





}

main()