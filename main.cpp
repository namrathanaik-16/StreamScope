#include<iostream>
#include<iomanip>
#include<fstream>
#include<sstream>
#include"sqlite3.h"
#include "json.hpp"
#include "httplib.h"
using json=nlohmann::json;
using namespace std;

string getVideoCodecName(const string& codec)
{
	if(codec.find("hev1")!=string::npos || codec.find("hvc")!=string::npos)
	return "HEVC(H.265)";

	if(codec.find("avc1")!=string::npos )
	return "H.264/AVC";

	if(codec.find("vp09")!=string::npos)
	return "VP9";

	if(codec.find("av01")!=string::npos)
	return "AV1";

	return codec;
}
string getAudioCodecName(const string& codec)
{
	if(codec.find("mp4a")!=string::npos)
	return "AAC-LC";

	if(codec.find("ec-3")!=string::npos)
	return "Dolby Digital Plus";

	if(codec.find("ac-3")!=string::npos)
	return "Dolby Digital";

	if(codec.find("opus")!=string::npos)
	return "Opus";

	return codec;

}
void generateMarkdownReport(

	json sessionInfo,
	json manifestBasics,
	json manifestTracks,
	json finalStats,
	json playbackEvents
)
{
	ofstream report("report.md");
	report<<"# StreamScope Playback Report\n\n";
	report<<"## Session Information\n";
	report<<"- Session ID:"
		  <<sessionInfo["sessionId"].get<string>()<<"\n";
	report<<"- Start Time:"
		  <<sessionInfo["startTime"].get<string>()<<"\n";
	report<<"- End Time:"
		  <<sessionInfo["endTime"].get<string>()<<"\n";
	report<<"- MPD URL:"
		  <<sessionInfo["mpdUrl"].get<string>()<<"\n";

	report<<"\n## Manifest Information\n";
	report<<"- MPD Type:"
	      <<manifestBasics["mpdType"].get<string>()<<"\n";
	report<<"- Duration:"
		  <<manifestBasics["duration"].get<string>()<<"\n";
	report<<"- DASH Profile:"
		  <<manifestBasics["profile"].get<string>()<<"\n";
	report<<"- Period Count:"
		  <<manifestBasics["periods"]<<"\n";
	report<<"- Video Adaptation Sets:"
	      <<manifestTracks["videoAdaptationSets"]<<"\n";
	report<<"- Audio Adaptation Sets:"
		  <<manifestTracks["audioAdaptationSets"]<<"\n";
	report<<"- Video Codec:"
		  <<manifestTracks["videoCodec"].get<string>()<<"\n";
	report<<"- Audio Codec:"
		  <<manifestTracks["audioCodec"].get<string>()<<"\n\n";


	
	report<<"## Playback Statistics\n";
	report<<"- Duration:"
		  <<finalStats["playbackDuration"]
		  <<"seconds\n";
	report<<"- Average Bitrate:"
	      <<finalStats["averageBitrateMbps"]
		  <<"Mbps\n";
	report<<"- Average Buffer Level:"
	      <<finalStats["averageBufferLevel"]
		  <<"seconds\n";
	report<<"- Dropped Frames:"
		  <<finalStats["droppedFrames"]
		  <<"\n\n";

	report<<"## Network Summary\n";

    report<<"- Total Requests:"
          <<finalStats["networkRequests"]<<"\n";
	report<<"- Completed Requests:"
          <<finalStats["completedRequests"]<<"\n";
	report<<"- Abandoned Requests:"
          <<finalStats["abandonedRequests"]<<"\n";
	report<<"- Completion Rate:"
          <<finalStats["completionRate"]<<"%\n";
	report<<"- Data Downloaded:"
      	  <<finalStats["dataDownloadedMB"]<<" MB\n";
	report<<"- Retry Attempts:"
          <<finalStats["retryAttempts"]<<"\n";
	report<<"- Errors:"
          <<finalStats["errors"]<<"\n\n";

	report<<"## Playback Health\n";
	int healthScore=100;
	if(finalStats["droppedFrames"]>0)
		healthScore-=10;
	if(finalStats["completionRate"]<100)
		healthScore-=20;
	if(finalStats["retryAttempts"]>0)
		healthScore-=10;
	if(finalStats["errors"]>0)
		healthScore-=30;
	string healthStatus;
	if(healthScore>=90)
		healthStatus="Excellent";
	else if(healthScore>=75)
		healthStatus="Good";
	else if(healthScore>=50)
		healthStatus="Fair";
	else
	    healthStatus="Poor";
	report<<"- Overall Score:"
		  <<healthScore
		  <<"/100\n";
	report<<"- Health Status:"
	      <<healthStatus
		  <<"\n";
		  
	report<<"\n## Observations\n";
	
	if(finalStats["completionRate"]==100)
		report<<"- ✓ Network completed all requests successfully.\n";
	if(finalStats["retryAttempts"]==0)
		report<<"- ✓ No retry attempts detected.\n";
	if(finalStats["errors"]==0)
		report<<"- ✓ No playback errors detected.\n";
	if(finalStats["droppedFrames"]==0)
		report<<"- ✓ No dropped frames detected.\n";
	else 
		report<<"- ⚠ Dropped frames were observed during playback.\n";

	report<<"\n## Representation Switch Analysis\n";
	int count=finalStats["representationSwitches"];
	string switchFrequency;
	string adaptationStability;
	if(count<=2)
	{
		switchFrequency="Low";
		adaptationStability="Stable";
	}
	else if(count<=5)
	{
		switchFrequency="Moderate";
		adaptationStability="Acceptable";
	}
	else{
		switchFrequency="High";
		adaptationStability="Unstable";
	}
	report<<"- Total Representation Switches:"<<count<<"\n";
	report<<"- Switch Frequency:"<<switchFrequency<<"\n";
	report<<"- Adaptation Stability:"<<adaptationStability<<"\n";

	report<<"\n## Bitrate Analysis\n";
	double averageBitrate=finalStats["averageBitrateMbps"];
	double highestBitrate=finalStats["highestBitrateMbps"];
	double lowestBitrate=finalStats["lowestBitrateMbps"];
	
	double bitrateVariation=highestBitrate-lowestBitrate;
	double variationPercentage=0.0;
	if(averageBitrate>0)
		variationPercentage=(bitrateVariation/averageBitrate)*100.0;
	string bitrateStability;
	if(variationPercentage<15)
	{
		bitrateStability="Stable";
	}
	else if(variationPercentage<=35)
	{
		bitrateStability="Moderate";
	}
	else
	{
		bitrateStability="Highly Variable";
	}
	report<<"- Average Bitrate: "<<averageBitrate<<" Mbps\n";
	report<<"- Highest Bitrate: "<<highestBitrate<<" Mbps\n";
	report<<"- Lowest Bitrate: "<<lowestBitrate<<" Mbps\n";
	report<<"- Bitrate Variation: "<<bitrateVariation<<" Mbps\n";
	report<<"- Variation Percentage: "<<fixed<<setprecision(2)
		  <<variationPercentage<<" %\n";
	report<<defaultfloat;
	report<<"- Bitrate Stability: "<<bitrateStability<<"\n";

	report.close();
	cout<<"Markdown report generated successfully!"<<endl;
}
void analyzePlayback(json playbackSession,sqlite3* db)
{
    int rc;

    json sessionInfo=playbackSession["sessionInfo"];
	json finalStats=playbackSession["finalStatistics"];
	json manifestBasic=playbackSession["manifestInfo"]["basic"];
	json manifestTracks=playbackSession["manifestInfo"]["tracks"];
	json manifestSegments=playbackSession["manifestInfo"]["segments"];
	json playbackEvents=playbackSession["playbackEvents"];

    //session report"
    cout<<"\n";
	cout<<"=======================================================\n";
	cout<<"              STREAMSCOPE SESSION REPORT\n";
	cout<<"=======================================================\n";
	cout<<"Session Information\n";
	cout<<"-------------------------------------------------------\n";
	cout<<"Session ID               :"
		<<sessionInfo["sessionId"].get<string>()<<endl;
	cout<<"Start Time               :"
		<<sessionInfo["startTime"].get<string>()<<endl;
	cout<<"End Time                 :"
		<<sessionInfo["endTime"].get<string>()<<endl;
	cout<<"MPD URL                  :"
		<<sessionInfo["mpdUrl"].get<string>()<<endl;
	cout<<"Playback Duration        :"
		<<finalStats["playbackDuration"].get<double>()
		<<" seconds"<<endl;

    //manifest summary
    cout<<"\n";
	cout<<"Manifest Summary\n";
	cout<<"------------------------------------------------------\n";
	cout<<"\nBasic Information\n";
	cout<<"---------------------------\n";
	cout<<"MPD Type                  :" 
	    <<manifestBasic["mpdType"].get<string>()<<endl;
	cout<<"Duration                  :"
		<<manifestBasic["duration"].get<string>()<<endl;
	cout<<"Periods                   :"
		<<manifestBasic["periods"]<<endl;
	cout<<"\nMedia Information\n";
	cout<<"---------------------------\n";
	string videoCodec= 
		manifestTracks["videoCodec"];
	cout<<"Video Codec                :"
		<<getVideoCodecName(videoCodec)
		<<endl;
	string audioCodec=
		manifestTracks["audioCodec"];
	cout<<"Audio Codec                :"
		<<getAudioCodecName(audioCodec)
		<<endl;
	cout<<"Video Adaptation Sets      :"
		<<manifestTracks["videoAdaptationSets"]<<endl;
	cout<<"Audio Adaptation Sets      :"
		<<manifestTracks["audioAdaptationSets"]<<endl;
	cout<<"Available Resolutions      :"
		<<manifestTracks["resolutions"].size()<<endl;
	cout<<"Available Bitrates         :" 
		<<manifestTracks["bitrates"].size()<<endl;
	cout<<"\nStreaming Information\n";
	cout<<"---------------------------\n";
	cout<<"Segment Type               :"
		<<manifestSegments["segmentType"].get<string>()<<endl;
	cout<<"Segment Duration           :"
		<<manifestSegments["segmentDuration"]<<" sec"<<endl;
	cout<<"DRM                        :"
		<<(manifestSegments["drmPresent"].get<bool>()?"Yes":"No")
		<<endl;

    //playback statistics
    cout<<"\n";
	cout<<"Playback Statistics\n";
	cout<<"------------------------------------------------------\n";
	cout<<"Average Bitrate          :"
		<<finalStats["averageBitrateMbps"]<<" Mbps"<<endl;
	cout<<"Highest Bitrate          :"
		<<finalStats["highestBitrateMbps"]<<" Mbps"<<endl;
	cout<<"Lowest Bitrate           :"
		<<finalStats["lowestBitrateMbps"]<<" Mbps"<<endl;
	cout<<"Average Buffer Level     :"
		<<finalStats["averageBufferLevel"]<<" Seconds"<<endl;
	cout<<"Dropped Frames           :"
		<<finalStats["droppedFrames"]<<endl;
	cout<<"Playback Events          :"
		<<finalStats["playbackEvents"]<<endl;
	cout<<"Representation Switches  :"
		<<finalStats["representationSwitches"]<<endl;
	

    //network summary
    cout<<"\n";
	cout<<"Network Summary\n";
	cout<<"-----------------------------------------------------\n";
	cout<<"Total Requests           :"
		<<finalStats["networkRequests"]<<endl;
	cout<<"Completed Requests       :"
	 	<<finalStats["completedRequests"]<<endl;
	cout<<"Abandoned Requests       :"
	 	<<finalStats["abandonedRequests"]<<endl;
	cout<<"Completion Rate          :"
		<<finalStats["completionRate"]<<"%"<<endl;
	cout<<"Data Downloaded          :"
	   	<< finalStats["dataDownloadedMB"]<<" MB"<<endl;
	cout<<"Retry Attempts           :"
		<<finalStats["retryAttempts"]<<endl;
	cout<<"Errors                   :"
		<<finalStats["errors"]<<endl;

    //playback health
    cout<<"\n";
	cout<<"Playback Health\n";
	cout<<"-----------------------------------------------------\n";
	int healthScore=100;
	if(finalStats["droppedFrames"]>0)
		healthScore-=10;
	if(finalStats["completionRate"]<100)
		healthScore-=20;
	if(finalStats["retryAttempts"]>0)
		healthScore-=10;
	if(finalStats["errors"]>0)
		healthScore-=30;

	string healthStatus;
	if(healthScore>=90)
		healthStatus="Excellent";
	else if(healthScore>=75)
		healthStatus="Good";
	else if(healthScore>=50)
		healthStatus="Fair";
	else
		healthStatus="Poor";

	cout<<"Overall Score             :"
		<<healthScore<<"/100"<<endl;
	cout<<"Health Status             :"
		<<healthStatus<<endl;

    //sql insert
    char* errMsg=nullptr;
	string insertSQL =
    "INSERT INTO playback_sessions "
    "(session_start, session_end, duration, average_bitrate, highest_bitrate, "
    "lowest_bitrate, average_buffer, dropped_frames, playback_errors, health_score) "
    "VALUES ('"
    + sessionInfo["startTime"].get<string>() + "', '"
    + sessionInfo["endTime"].get<string>() + "', "
    + to_string(finalStats["playbackDuration"].get<double>()) + ", "
    + to_string(finalStats["averageBitrateMbps"].get<double>()) + ", "
    + to_string(finalStats["highestBitrateMbps"].get<double>()) + ", "
    + to_string(finalStats["lowestBitrateMbps"].get<double>()) + ", "
    + to_string(finalStats["averageBufferLevel"].get<double>()) + ", "
    + to_string(finalStats["droppedFrames"].get<int>()) + ", "
    + to_string(finalStats["errors"].get<int>()) + ", "
    + to_string(healthScore)
    + ");";
	rc=sqlite3_exec(db,insertSQL.c_str(),nullptr,nullptr,&errMsg);
	if(rc!=SQLITE_OK)
	{
		cout<<"Error Inserting data:"<<errMsg<<endl;
		sqlite3_free(errMsg);
	}
	else
	{
		cout<<"Playback Session Stored successfully!"<<endl;
	}


    //stored session in database
    cout<<"\n Stored Session in Database\n";
	cout<<"------------------------------------------------------\n";

	string selectSQL="SELECT * FROM playback_sessions";
	auto callback=[](void* data, int argc, char** argv,char** azColName)->int
	{
		for(int i=0;i<argc;i++)
		{
			cout<<azColName[i]<<":"
				<<(argv[i]?argv[i]:"NULL")<<endl;
		}
		cout<<"------------------------------------------------------\n";
		return 0;
	};
	rc=sqlite3_exec(db,selectSQL.c_str(),callback,nullptr,&errMsg);
	if(rc!=SQLITE_OK)
	{
		cout<<"Error Reading data:"<<errMsg<<endl;
		sqlite3_free(errMsg); 

	};

    //observations
    cout<<"\nObservations\n";
	if(finalStats["completionRate"]==100)
		cout<<"[OK] Network completed all requests successfully.\n";
	if(finalStats["retryAttempts"]==0)
		cout<<"[OK] No retry attempts detected.\n";
	if(finalStats["errors"]==0)
		cout<<"[OK] No playback errors detected.\n";
	if(finalStats["droppedFrames"]>0)
		cout<<"[WARNING] Dropped frames were observed during playback.\n";
    
    //representation switch analysis
    cout<<"\n";
	cout<<"Representation Switch Analysis\n";
	cout<<"------------------------------------------------------\n";
	int count= finalStats["representationSwitches"];
	string switchFrequency;
	string adaptationStability;
	if(count<=2)
	{
		switchFrequency="Low";
		adaptationStability="Stable";
	}
	else if(count<=5)
	{
		switchFrequency="Moderate";
		adaptationStability="Acceptable";
	}
	else
	{
		switchFrequency="High";
		adaptationStability="Unstable";
	}
	cout<<"Total Representation Switches       :"
		<<count<<endl;
	cout<<"Switch Frequency                    :"
		<<switchFrequency<<endl;
	cout<<"Adaptation Stability                :"
		<<adaptationStability<<endl;

    //bitrate analysis
    cout<<"\n";
	cout<<"Bitrate Analysis\n";
	cout<<"-----------------------------------------------------\n";
	double averageBitrate=finalStats["averageBitrateMbps"];
	double highestBitrate=finalStats["highestBitrateMbps"];
	double lowestBitrate=finalStats["lowestBitrateMbps"];
	double bitrateVariation=highestBitrate-lowestBitrate;
	double variationPercentage=(bitrateVariation/averageBitrate)*100.0;

	string bitrateStability;
	if(variationPercentage<15)
	{
		bitrateStability="Stable";
	}
	else if(variationPercentage<=35)
	{
		bitrateStability="Moderate";
	}
	else{
		bitrateStability="Highly Variable";
	}
	cout<<"Average Bitrate           :"
		<<averageBitrate<<"Mbps"<<endl;
	cout<<"Highest Bitrate           :"
		<<highestBitrate<<"Mbps"<<endl;
	cout<<"Lowest Bitrate            :"
		<<lowestBitrate<<"Mbps"<<endl;
	cout<<"Bitrate Variation         :"
		<<bitrateVariation<<"Mbps"<<endl;
	cout<<"Variation Percentage      :"
		<<fixed<<setprecision(2)
		<<variationPercentage<<"%"<<endl;
	cout<<defaultfloat;
	cout<<"Bitrate Stability         :"
		<<bitrateStability<<endl;

    //playback timeline
    cout<<"\n";
	cout<<"Playback Timeline\n";
	cout<<"-----------------------------------------------------\n";
	cout<<fixed<<setprecision(2);
	for(auto &event : playbackEvents)
	{
		string eventName=event["event"];
		double playbackTime=event["playbackTime"];

		if(eventName=="STREAM_LOADING")
		{
			cout<<playbackTime<<" s"
				<<"  Stream Loading"<<endl;
			
		}
		else if(eventName=="PLAYBACK_STARTED")
		{
			cout<<playbackTime<<" s"
				<<"  Playback Started"<<endl;
		}
		else if(eventName=="REPRESENTATION_SWITCH")
		{
			if (event["details"]["to"].is_null())
        continue;

        string resolution = event["details"]["to"]["resolution"];
        double bitrate =
        event["details"]["to"]["bitrate"].get<double>() / 1000000.0;

        cout << playbackTime << " s"
             << "    Switched to "
             << resolution
             << " ("
             << fixed << setprecision(2)
             << bitrate
             << " Mbps)"
             << endl;
		}
		else if(eventName=="AUDIO_TRACK_CHANGED")
		{
			cout<<playbackTime<<" s"
				<<"  Audio Track Changed"<<endl;
		}
		else if(eventName=="PLAYBACK_PAUSED")
		{
			cout<<playbackTime<<" s"
				<<"  Playback Paused"<<endl;
		}
		else if(eventName=="PLAYBACK_ENDED")
		{
			cout<<playbackTime<<" s"
				<<"  Playback Paused"<<endl;
		}
	}
	cout<<defaultfloat;
	cout << "Calling generateMarkdownReport..." << endl;
	generateMarkdownReport(
		sessionInfo,
		manifestBasic,
		manifestTracks,
		finalStats,
		playbackEvents
	);
}


int main(){
	//database
	sqlite3* db;
	int rc;
	rc=sqlite3_open("StreamScope.db",&db);
	if(rc)
	{
		cout<<"Can't Open database:"<<sqlite3_errmsg(db)<<endl;
		sqlite3_close(db);
		return 1;

	}
	else
	{
		cout<<"Database Opened Successfully"<<endl;
		char* errMsg=nullptr;
		
		string createTableSql=R"(
		CREATE TABLE IF NOT EXISTS playback_sessions(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			session_start TEXT,
			session_end TEXT,
			duration REAL,
			average_bitrate REAL,
			highest_bitrate REAL,
			lowest_bitrate REAL,
			average_buffer REAL,
			dropped_frames INTEGER,
			playback_errors INTEGER,
			health_score INTEGER
		
		);
		)";
		rc=sqlite3_exec(db,createTableSql.c_str(),nullptr,nullptr,&errMsg);
		if(rc!=SQLITE_OK)
		{
			cout<<"Error Creating table:"<<errMsg<<endl;
			sqlite3_free(errMsg);
		}
		else{
			cout<<"Table Created successfully"<<endl;
		}
	}
	httplib::Server server;
	server.Options("/playback",
	[](const httplib::Request& req,
			 httplib::Response& res)
	{
		res.set_header("Access-Control-Allow-Origin","*");
		res.set_header("Access-Control-Allow-Methods","POST,GET,OPTIONS");
		res.set_header("Access-Control-Allow-Headers","Content-Type");
		res.status=200;
	});
    //post
	server.Post("/playback",
    [&db](const httplib::Request& req,
      httplib::Response& res)
{
    cout<<"Received JSON\n";
    cout<<req.body<<endl;
    json playbackSession=json::parse(req.body);
    analyzePlayback(playbackSession,db);
	res.set_header("Access-Control-Allow-Origin", "*");
    res.set_content("JSON received","text/plain");
});
    //get
    server.Get("/sessions",
	[&](const httplib::Request& req,
	         httplib::Response& res)
			{
                static int count=0;
                count++;
                cout<<"Get /sessions called. Count = "<<count<<endl;
				const char* sql =
                     "SELECT id, session_start, session_end, duration, "
                     "average_bitrate, highest_bitrate, lowest_bitrate, "
                     "average_buffer, dropped_frames, playback_errors, "
                     "health_score "
                     "FROM playback_sessions;";
                sqlite3_stmt* stmt;
                int rc = sqlite3_prepare_v2(
                    db,
                    sql,
                    -1,
                    &stmt,
                    nullptr
                );
                if(rc!=SQLITE_OK)
                {
                    res.set_content("Failed to prepare SQL query","text/plain");
                    return;
				}
				json sessions=json::array();
                while(sqlite3_step(stmt)==SQLITE_ROW)
                {
                    int id = sqlite3_column_int(stmt,0);

					const unsigned char* sessionStart=
						sqlite3_column_text(stmt,1);
					double duration=
						sqlite3_column_double(stmt,3);
					double averageBitrate=
						sqlite3_column_double(stmt,4);
					double healthScore=
						sqlite3_column_double(stmt,10);
					
					//converting into json format
					json session;
					session["id"]=id;
					session["session_start"]=reinterpret_cast<const char*>(sessionStart);
					session["duration"]=duration;
					session["average_bitrate"]=averageBitrate;
					session["health_score"]=healthScore;
					sessions.push_back(session);
				}
				sqlite3_finalize(stmt);	
					

                res.set_header("Access-Control-Allow-Origin", "*");
				res.set_content(sessions.dump(4), "application/json");
				
			});


	

	cout<<"Server running on http://localhost:8000"<<endl;
	server.Get("/report",
	[](const httplib::Request& req,
			 httplib::Response& res)
	{
		std:: ifstream report("report.md");
		if(!report.is_open())
		{
			res.status=404;
			res.set_content("Report not found","text/plain");
			return;
		}
		std::stringstream buffer;
		buffer<<report.rdbuf();

		res.set_header("Access-Control-Allow-Origin","*");
		res.set_content(buffer.str(),"text/plain");
	});
	server.listen("0.0.0.0",8000);
    
	sqlite3_close(db);
	}
