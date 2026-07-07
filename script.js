const loadButton = document.getElementById("loadButton");
const mpdUrlInput = document.getElementById("mpdUrl");
const video = document.getElementById("videoPlayer");
let player = null;
let previousRepresentation=null;
const logContainer=document.getElementById("logContainer")

//logs collection
let sessionLogs=[];
let networkLogs=[];
function addLog(category,eventName,details={}){  
    const logEntry={
        timestamp:new Date().toISOString(),
        category:category,
        event:eventName,
        playbackTime:video.currentTime||0,
        details:details
    };
    sessionLogs.push(logEntry);
    console.log("[PLAYBACK LOG]",logEntry);
    //logs appear in the webpages
    const logItem=document.createElement("details");
    const logSummary=document.createElement("summary");
    logSummary.textContent=`[${category}] ${eventName} | `+`Time:${logEntry.playbackTime.toFixed(2)}s`;
    const logDetails=document.createElement("pre");
    logDetails.textContent=JSON.stringify(logEntry,null,2);
    logItem.appendChild(logSummary);
    logItem.appendChild(logDetails);
    logContainer.appendChild(logItem);
}

//adding more information to the log
function getPlaybackContext(){
    let bufferLevel=0;
    if(video.buffered.length>0){
        const bufferedEnd=video.buffered.end(video.buffered.length-1);
        bufferLevel=Math.max(0,bufferedEnd-video.currentTime);
    }
    const representation=player?.getCurrentRepresentationForType("video");
    return{
        paused:video.paused,
        ended:video.ended,
        playbackRate:video.playbackRate,
        duration:video.duration,
        bufferLevel:bufferLevel,
        resolution:representation
            ?representation.width + "x" + representation.height
            :null,
        bitrate:representation
            ?representation.bandwidth
            :null
    };
}

//valid mpd url
loadButton.addEventListener("click",function(){
    const mpdUrl = mpdUrlInput.value.trim();
    if(mpdUrl===""){
        alert("Please enter an MPD URL");
        return;
    }
    if(!mpdUrl.includes(".mpd")){
        alert("Please enter a valid MPD URL");
        return;
    }
    if(player){
        player.destroy();
    }
    player = dashjs.MediaPlayer().create();
    player.initialize(video,mpdUrl,true);
    const ttmlRenderingDiv=
            document.getElementById("ttmlRenderingDiv");
        player.attachTTMLRenderingDiv(ttmlRenderingDiv);

     //for loading events 
    
    addLog("SESSION","STREAM_LOADING",{   
        mpdUrl:mpdUrl
    });

    // subtitle detection
    player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED,function(){
        const textTracks=player.getTracksFor("text");
        console.log("Available subtitles tracks:",textTracks);
        addLog(
            "SUBTITLE","SUBTITLE_TRACKS_DETECTED",
            {
                count:textTracks.length,
                tracks:textTracks
            }
        );
    });

    //subtitle track change
    player.on(dashjs.MediaPlayer.events.TRACK_CHANGE_RENDERED,
        function(event){
            if(event.mediaType!=="text")return;
            addLog("SUBTITLE","SUBTITLE_TRACK_CHANGED",
                {
                    from:event.oldMediaInfo
                    ?{
                        language:event.oldMediaInfo.lang,
                        index:event.oldMediaInfo.index,
                        codec:event.oldMediaInfo.codec
                    }
                    :null,
                    to:event.newMediaInfo
                    ?{
                        language:event.newMediaInfo.lang,
                        index:event.newMediaInfo.index,
                        codec:event.newMediaInfo.codec
                    }
                    :null,
                    playbackContext:getPlaybackContext()
                }
            );
        }
    );

    //fragment loading
    //fragment abandoned
    player.on(dashjs.MediaPlayer.events.FRAGMENT_LOADING_ABANDONED,
        function(event){
            const request = event.request;
            if(request){
                networkLogs.push({
                    timestamp:new Date().toISOString(),
                    status:"abandoned",
                    mediaType:event.mediaType,
                    fragmentType:request.type,
                    segmentIndex:request.index,
                    startTime:request.startTime,
                    duration:request.duration,
                    bandwidth:request.bandwidth,
                    bytesLoaded:Number.isFinite(request.bytesLoaded)
                        ?request.bytesLoaded
                        :null,
                retryAttempts:request.retryAttempts,
                url:request.url
                });
            }
            addLog("NETWORK","FRAGMENT_LOADING_ABANDONED",
                {
                    mediaType:event.mediaType,
                    fragmentType:request?request.type:null,
                    segmentIndex:request?request.index:null,
                    startTime:request?request.startTime:null,
                    duration:request?request.duration:null,
                    bandwidth:request?request.bandwidth:null,
                    retryAttempts:request?request.retryAttempts:null,
                    bytesLoaded:request && Number.isFinite(request.bytesLoaded)
                        ?request.bytesLoaded
                        :null,
                    url:request?request.url:null,
                    playbackContext:getPlaybackContext()
                }
            );
        }
    );

    //fragment completed
    player.on(dashjs.MediaPlayer.events.FRAGMENT_LOADING_COMPLETED,
        function(event){
            const request=event.request;
            if(!request) return;
            const networkEntry={
                timestamp:new Date().toISOString(),
                status:"completed",
                mediaType:event.mediaType,
                fragmentType:request.type,
                segmentIndex:request.index,
                startTime:request.startTime,
                duration:request.duration,
                bandwidth:request.bandwidth,
                bytesLoaded:request.bytesLoaded,
                retryAttempts:request.retryAttempts,
                url:request.url
            };
            networkLogs.push(networkEntry);

        }
    );
    


    //playback listeners
    player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED,function(){
        document.getElementById("playbackState").textContent="Playing";
    });
    player.on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED,function(){
        document.getElementById("playbackState").textContent="Paused";
    });

    //logs of playback events
    player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED,function(){
        addLog("PLAYBACK","PLAYBACK_STARTED",getPlaybackContext());
    });
    player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING,function(){
        addLog("PLAYBACK","PLAYBACK_PLAYING",getPlaybackContext());
    });
    player.on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED,function(){
        addLog("PLAYBACK","PLAYBACK_PAUSED",getPlaybackContext());
    });
    player.on(dashjs.MediaPlayer.events.PLAYBACK_SEEKING,function(){
        addLog("PLAYBACK","PLAYBACK_SEEKING",getPlaybackContext());
    });
    player.on(dashjs.MediaPlayer.events.PLAYBACK_SEEKED,function(){
        addLog("PLAYBACK","PLAYBACK_SEEKED",getPlaybackContext());
    });
    player.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED,function(){
        addLog("PLAYBACK","PLAYBACK_ENDED",getPlaybackContext());
    });

    //buffer events logs
    player.on(dashjs.MediaPlayer.events.BUFFER_EMPTY,function(){
        addLog("BUFFER","BUFFER_EMPTY",getPlaybackContext());
    });
    player.on(dashjs.MediaPlayer.events.BUFFER_LOADED,function(){
        addLog("BUFFER","BUFFER_LOADED",getPlaybackContext());
    });

    //quality change logs
    player.on(dashjs.MediaPlayer.events.REPRESENTATION_SWITCH,
        function(event){
            if(event.mediaType!=="video")return;
            const currentRepresentation=
                player.getCurrentRepresentationForType("video");
            addLog(
                "QUALITY",
                "REPRESENTATION_SWITCH",
                {
                    from:previousRepresentation,
                    to:currentRepresentation
                        ?{
                            id:currentRepresentation.id,
                            resolution:
                                currentRepresentation.width + "x" +
                                currentRepresentation.height,
                            bitrate:currentRepresentation.bandwidth
                        }
                        :null,
                    playbackContext:getPlaybackContext()
                }
            );
            if(currentRepresentation){
                previousRepresentation={
                    id:currentRepresentation.id,
                    resolution:
                        currentRepresentation.width + "x" +
                        currentRepresentation.height,
                    bitrate: currentRepresentation.bandwidth
                };
            }

            
        }
    );

    //diagnostic dashboard
    setInterval(function(){
        if(!player) return;
        const currentQuality= player.getCurrentRepresentationForType("video");
        if(currentQuality){
            document.getElementById("resolution").textContent =
                currentQuality.width + "x" + currentQuality.height;
            document.getElementById("bitrate").textContent=
                (currentQuality.bandwidth/1000000).toFixed(2)+"Mbps";
        }
        let buffer=0;
        if(video.buffered.length>0){
            const bufferedEnd=video.buffered.end(video.buffered.length-1);
            buffer=bufferedEnd-video.currentTime;
        }
        document.getElementById("bufferLevel").textContent=
            Math.max(0,buffer).toFixed(2)+"sec";
    },1000);
        
});
