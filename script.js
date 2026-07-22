const loadButton = document.getElementById("loadButton");
const mpdUrlInput = document.getElementById("mpdUrl");
const video = document.getElementById("videoPlayer");
let player = null;
let previousRepresentation=null;
let playbackSession=null;
const logContainer=document.getElementById("logContainer")
const endSessionButton=document.getElementById("endSessionButton");
const exportSessionButton = document.getElementById("exportSessionButton");

//logs collection
let sessionLogs=[];
let networkLogs=[];
let bufferHistory=[];
let bufferChart=null;
let bitrateHistory=[];
let bitrateChart=null;
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
    document.getElementById("logCount").textContent=`${sessionLogs.length} Events`;
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
 //network summary
    function getNetworkSummary(){
        const totalRequests=networkLogs.length;
        const completedRequests=networkLogs.filter(function(entry){
            return entry.status==="completed";
        }).length;
        const abandonedRequests=networkLogs.filter(function(entry){
            return entry.status==="abandoned";
        }).length;
        const completionRate = totalRequests>0
            ?(completedRequests/totalRequests )*100
            :0;
        let totalBytesDownloaded=0;
        networkLogs.forEach(function(entry){
            if(
                entry.status==="completed" && Number.isFinite(entry.bytesLoaded)
            ){
                totalBytesDownloaded+=entry.bytesLoaded;
            }
        });
        const totalMegabytesDownloaded=totalBytesDownloaded/1000000;
        let totalRetryAttempts=0;
        networkLogs.forEach(function(entry){
            if(Number.isFinite(entry.retryAttempts)){
                totalRetryAttempts+=entry.retryAttempts;
            }
        });
        
        return{
            totalRequests:totalRequests,
            completedRequests:completedRequests,
            abandonedRequests:abandonedRequests,
            completionRate:completionRate,
            totalBytesDownloaded:totalBytesDownloaded,
            totalMegabytesDownloaded:totalMegabytesDownloaded,
            totalRetryAttempts:totalRetryAttempts
        };
    }
// buffer chart
const bufferCanvas=document.getElementById("bufferChart");
bufferChart=new Chart(bufferCanvas,{
    type:"line",
    data:{
        labels:[],
        datasets:[
            {
                label:"Buffer Level(seconds)",
                data:[],
                tension:0.6
            }
        ]
    },
    options:{
        responsive:true,
        maintainAspectRatio:false
    }
});

//bitrate chart
const bitrateCanvas=document.getElementById("bitrateChart");
bitrateChart=new Chart(bitrateCanvas,{
    type:"line",
    data:{
        labels:[],
        datasets:[{

        
            label:"Bitrate(Mbps)",
            data:[],
            tension:0.6
            }
        ]
    },
    options:{
        responsive:true,
        maintainAspectRatio:false
    }
});

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
    initializePlaybackSession(mpdUrl);
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
        analyzeBasicManifest();
        analyzeManifestTracks();
        analyzeSegmentAndDRM();
        const textTracks=player.getTracksFor("text");
        console.log("Available subtitles tracks:",textTracks);
        addLog(
            "SUBTITLE","SUBTITLE_TRACKS_DETECTED",
            {
                count:textTracks.length,
                tracks:textTracks
            }
        );

        //audio track logs
        const audioTracks=player.getTracksFor("audio");
        addLog(
            "AUDIO","AUDIO_TRACKS_DETECTED",
            {
                count:audioTracks.length,
                tracks:audioTracks.map(function(track){
                    return{
                        language:track.lang,
                        index:track.index,
                        codec:track.codec,
                        mimeType:track.mimeType,
                        representationCount:track.representationCount
                    };
                })
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

    //audio track change
    player.on(dashjs.MediaPlayer.events.TRACK_CHANGE_RENDERED,
        function(event){
            if(event.mediaType!=="audio") return;
            addLog(
                "AUDIO","AUDIO_TRACK_CHANGED",{
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

   
    
    //player error
    player.on(dashjs.MediaPlayer.events.ERROR,
        function(event){
            const error=event.error;
            const request = error && error.data
                ?error.data.request
                :null;
            const response= error && error.data
                ?error.data.response
                :null;
            const errorInfo={
                timestamp:new Date().toISOString(),
                code:error?error.code:null,
                message:error?error.message:null,
                playbackTime:video.currentTime,
                playbackContext:getPlaybackContext()
            };
            addLog("ERROR","PLAYER_ERROR",
                {
                    code:error?error.code:null,
                    message:error?error.message:null,

                    request:request
                        ?{
                            type:request.type,
                            mediaType:request.mediaType,
                            url:request.url,
                            retryAttempts:request.retryAttempts,
                            fileLoaderType:request.fileLoaderType
                        }
                        :null,
                        response:response
                            ?{
                                status:response.status,
                                statusText:response.statusText,
                                redirected:response.redirected,
                                duration:
                                    response.resourceTiming &&
                                    Number.isFinite(response.resourceTiming.duration)
                                        ?response.resourceTiming.duration
                                        :null
                            }
                            :null,
                            playbackContext:getPlaybackContext()
                }
            );
            playbackSession.errors.push(errorInfo);
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
            const switchInfo={
                timestamp:new Date().toISOString(),
                playbackTime:video.currentTime,
                from:previousRepresentation,
                to:currentRepresentation
                    ?{
                        id:currentRepresentation.id,
                        resolution:
                            currentRepresentation.width + "x" +
                            currentRepresentation.height,
                        bitrate:currentRepresentation.bandwidth
                    }
                    :null
            };
            addLog(
                "QUALITY",
                "REPRESENTATION_SWITCH",
                {
                    ...switchInfo,
                    playbackContext:getPlaybackContext()
                }
            );
            playbackSession.representationSwitches.push(switchInfo);
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
        const currentAudio=player.getCurrentRepresentationForType("audio");
        if(currentQuality){
            document.getElementById("resolution").textContent =
                currentQuality.width + "x" + currentQuality.height;
            document.getElementById("bitrate").textContent=
                (currentQuality.bandwidth/1000000).toFixed(2)+"Mbps";
            document.getElementById("videoCodec").textContent=
                currentQuality.codecFamily
                ?currentQuality.codecFamily.toUpperCase()
                :"-"
            
            //bitrate history
            if(!video.paused && !video.ended){
                bitrateHistory.push({
                    time:video.currentTime,
                    bitrate:currentQuality.bandwidth
                });
                bitrateChart.data.labels.push(
                    video.currentTime.toFixed(1)
                );
                bitrateChart.data.datasets[0].data.push(
                    currentQuality.bandwidth/1000000
                );
                if(bitrateChart.data.labels.length>30){
                    bitrateChart.data.labels.shift();
                    bitrateChart.data.datasets[0].data.shift();
                }
                bitrateChart.update("none");
            }
        }
        //audio codec
        if(currentAudio){
            document.getElementById("audioCodec").textContent=
                currentAudio.codecFamily
                    ?currentAudio.codecFamily.toUpperCase()
                    :"-";
        }
        let buffer=0;
        if(video.buffered.length>0){
            const bufferedEnd=video.buffered.end(video.buffered.length-1);
            buffer=bufferedEnd-video.currentTime;
        }
        document.getElementById("bufferLevel").textContent=
            Math.max(0,buffer).toFixed(2)+"sec";
        
        //buffer chart
        if (!video.paused && !video.ended) {
            bufferHistory.push({
            time: video.currentTime,
            bufferLevel: Math.max(0, buffer)
        });

            bufferChart.data.labels.push(
                video.currentTime.toFixed(1)
            );

            bufferChart.data.datasets[0].data.push(
                Math.max(0, buffer)
            );
            if(bufferChart.data.labels.length>30){
                bufferChart.data.labels.shift();
                bufferChart.data.datasets[0].data.shift();
            }
            bufferChart.update("none");
        }

        //dropped frames
        const videoQuality=video.getVideoPlaybackQuality();
        document.getElementById("droppedFrames").textContent=
            videoQuality.droppedVideoFrames;

        //network summary
        const networkSummary = getNetworkSummary();
        document.getElementById("totalRequests").textContent = 
            networkSummary.totalRequests;
        document.getElementById("completedRequests").textContent = 
            networkSummary.completedRequests;
        document.getElementById("abandonedRequests").textContent = 
            networkSummary.abandonedRequests;
        document.getElementById("completionRate").textContent = 
            networkSummary.completionRate.toFixed(2) + "%";
        document.getElementById("dataDownloaded").textContent =
            networkSummary.totalMegabytesDownloaded.toFixed(2) + "MB";
        document.getElementById("totalRetries").textContent = 
            networkSummary.totalRetryAttempts;
        
    },1000);
        
});

//manifest details
function analyzeBasicManifest(){
    const manifest = player.getManifest();
    if(!manifest){
        console.log("Manifest data is not available");
        return;
    }
    const mpdType=manifest.type || "static";
    const duration=Number.isFinite(video.duration)
        ?Math.round(video.duration)+"s"
        :"Unknown";
    const profile = manifest.profiles || "Not specified";
    const periods = manifest.Period
        ?manifest.Period.length
        :0;
    playbackSession.manifestInfo.basic={
        mpdType:mpdType,
        duration:duration,
        profile:profile,
        periods:periods
    };

    document.getElementById("mpdType").textContent=
        mpdType;
    document.getElementById("mpdDuration").textContent=
        duration;
    document.getElementById("dashProfile").textContent=
        profile;
    document.getElementById("periodCount").textContent=
        periods;
    console.log("Basic Manifest Analysis:",{
        type:mpdType,
        duration:duration,
        profile:profile,
        periods:periods
    });
    
}

//manifest tracks
function analyzeManifestTracks(){
    const videoTracks = player.getTracksFor("video");
    const audioTracks = player.getTracksFor("audio");
    document.getElementById("videoAdaptationSets").textContent = 
        videoTracks.length;
    document.getElementById("audioAdaptationSets").textContent = 
        audioTracks.length;
    if(videoTracks.length>0){
        const videoTrack=videoTracks[0];

        const resolutions=[
            ...new Set(
                videoTrack.bitrateList.map(representation=>
                    representation.width + "x" + representation.height
                )
            )
        ];
        const bitrates = videoTrack.bitrateList.map(
            representation=>
            (representation.bandwidth/1000000).toFixed(1) + " Mbps"
            

        );
        document.getElementById("availableResolutions").textContent=
            resolutions.join(", ");
        document.getElementById("availableBitrates").textContent=
            bitrates.join(", ");
        let videoCodec = videoTrack.codec || "Not Specified";
        if(videoCodec.includes("hev1") || videoCodec.includes(hvc1)){
            videoCodec="HEVC(H.265)";
        }
        else if(videoCodec.includes("avc1")){
            videoCodec="AVC(H.264)";

        }
        else if(videoCodec.includes("vp9")){
            videoCodec="VP9";
        }
        document.getElementById("manifestVideoCodec").textContent=videoCodec;



    }
    if(audioTracks.length>0){
        let audioCodec=audioTracks[0].codec || "Not specified";
        if(audioCodec.includes("mp4a")){
            audioCodec="AAC";
        }
        else if(audioCodec("ec-3")){
            audioCodec="Dolby Digital Plus";
        }
        document.getElementById("manifestAudioCodec").textContent=audioCodec;
    }
    playbackSession.manifestInfo.tracks={
        videoAdaptationSets:videoTracks.length,
        audioAdaptationSets:audioTracks.length,
        resolutions:videoTracks.length>0
            ?videoTracks[0].bitrateList.map(rep=>
                rep.width + "x" + rep.height)
            :[],
        bitrates:videoTracks.length>0
            ?videoTracks[0].bitrateList.map(rep=>
                rep.bandwidth)
            :[],
        videoCodec:videoTracks.length>0
            ?videoTracks[0].codec
            :null,
        audioCodec:audioTracks.length>0
            ?audioTracks[0].codec
            :null
    };
    console.log("Manifest Track Analysis:",{
        videoTracks:videoTracks,
        audioTracks:audioTracks
    });
}
//segment and DRM analze
function analyzeSegmentAndDRM(){
    const manifest=player.getManifest();
    const videoRepresentation=player.getCurrentRepresentationForType("video");

    if(videoRepresentation){
        document.getElementById("segmentType").textContent=
            videoRepresentation.segmentInfoType || "Not Specified";
        document.getElementById("segmentDuration").textContent=
            videoRepresentation.segmentDuration
                ?Math.round(videoRepresentation.segmentDuration)+"s"
                :"Not Specified";
    }
    const manifestText=JSON.stringify(manifest);
    const drmPresent=
            manifestText.includes("ContentProtection")||manifestText.includes("contentProtection");
    document.getElementById("drmPresent").textContent=
        drmPresent ?"Yes":"No";
    playbackSession.manifestInfo.segments={
        segmentType:videoRepresentation
            ?videoRepresentation.segmentInfoType
            :null,
        segmentDuration:videoRepresentation
            ?videoRepresentation.segmentDuration
            :null,
        drmPresent:drmPresent
    };
    console.log("Segment and DRM Analysis:",{
        segmentType:videoRepresentation?.segmentInfoType,
        segmentDuration:videoRepresentation?.segmentDuration,
        drmPresent:drmPresent
    });
}
//playback session
function initializePlaybackSession(mpdUrl){
    console.log("initializePlaybackSession called")
    playbackSession={
        sessionInfo:{
            sessionId:"session_"+Date.now(),
            startTime:new Date().toISOString(),
            endTime:null,
            mpdUrl:mpdUrl

        },
        manifestInfo:{
            basic:{},
            tracks:{},
            segments:{}
        },
        playbackEvents:sessionLogs ,
        networkRequests:networkLogs,
        representationSwitches:[],
        bufferHistory:bufferHistory,
        bitrateHistory:bitrateHistory,
        errors:[],
        finalStatistics:{}
    };
    console.log("Playback Session Initialized:",playbackSession);
}
function calculateFinalStatistics(){

    const bitrateValues = bitrateHistory.map(function(item){
        return item.bitrate;
    });

    const bufferValues = bufferHistory.map(function(item){
        return item.bufferLevel;
    });

    const averageBitrate =
        bitrateValues.length > 0
            ? bitrateValues.reduce(function(sum,value){
                return sum + value;
            },0) / bitrateValues.length
            :0;

    const averageBuffer =
        bufferValues.length > 0
            ? bufferValues.reduce(function(sum,value){
                return sum + value;
            },0) / bufferValues.length
            :0;

    const networkSummary = getNetworkSummary();

playbackSession.finalStatistics = {

        playbackDuration:
            Number(video.currentTime.toFixed(2)),

        averageBitrateMbps:
            Number((averageBitrate / 1000000).toFixed(2)),

        highestBitrateMbps:
            bitrateValues.length > 0
                ? Number((Math.max(...bitrateValues) / 1000000).toFixed(2))
                :0,

        lowestBitrateMbps:
            bitrateValues.length > 0
                ? Number((Math.min(...bitrateValues) / 1000000).toFixed(2))
                :0,

        averageBufferLevel:
            Number(averageBuffer.toFixed(2)),

        droppedFrames:
            video.getVideoPlaybackQuality().droppedVideoFrames,

        playbackEvents:
            playbackSession.playbackEvents.length,

        representationSwitches:
            playbackSession.representationSwitches.length,

        networkRequests:
            networkSummary.totalRequests,

        completedRequests:
            networkSummary.completedRequests,

        abandonedRequests:
            networkSummary.abandonedRequests,

        completionRate:
            Number(networkSummary.completionRate.toFixed(2)),

        dataDownloadedMB:
            Number(networkSummary.totalMegabytesDownloaded.toFixed(2)),

        retryAttempts:
            networkSummary.totalRetryAttempts,

        errors:
            playbackSession.errors.length
    };
}
endSessionButton.addEventListener("click",function(){
    if(!playbackSession){
        alert("No active playback session,");
        return;
    }
    console.log(playbackSession)
    playbackSession.sessionInfo.endTime=
        new Date().toISOString();
    calculateFinalStatistics();
    video.pause();
    console.log("Playback Session completed:");
    console.log(playbackSession);
    alert("Playback Session Completed");

})
function exportPlaybackSession(){
    if(!playbackSession){
        alert("No playback session available");
        return;
    }
    const sessionJson=JSON.stringify(playbackSession,null,4);
    const blob=new Blob(
        [sessionJson],
        {
            type:"application/json"
        }
    );
    const url=URL.createObjectURL(blob);
    const downloadLink=document.createElement("a");
    downloadLink.href=url;
    downloadLink.download=playbackSession.sessionInfo.sessionId+".json";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
exportSessionButton.addEventListener(
    "click",
    function(){
        exportPlaybackSession();
    }
);