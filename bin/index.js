#!/usr/bin/env node

var Git = require("nodegit"),
    moment = require("moment"),
    program = require('commander');

function format(data){
    var y = data["years"],
        mo = data["months"],
        d = data["days"],
        h = data["hours"],
        mi = data["minutes"],
        s = data["seconds"];        
    
    return (!y ? "" : y + " years ")
        + (!mo ? "" : mo + " months ")
        + (!d ? "" : d + " days ")
        + (!h ? "" : h + " hours ") 
        + (!mi ? "" : mi + " minutes ")
        + (!s ? "" : s + " seconds");  
}

function main(fromsha, tosha){
    Git.Repository.open(process.cwd())
    .then(function(repo){
        repo.getCurrentBranch()
        .then(function(ref){
            return repo.getBranchCommit(ref.shorthand());
        })
        .then(function(commit){
            var emitter = commit.history();       
            emitter.on('end', function(commits){
                var dateFrom, 
                    dateTo;    
                
                for (var i = 0; i < commits.length; i++) {        
                    if (dateFrom && dateTo) {
                        break;
                    }
                    
                    var commit = commits[i], 
                        sha = commit.sha();
                        
                    if (fromsha === sha) {
                        dateFrom = commit.date();
                    }
                    
                    if (tosha === sha) {
                        dateTo = commit.date();
                    }
                }
                
                if (!dateFrom || !dateTo) {
                    console.error("could not find a commit in the history");
                    process.exit();
                }
                
                var momentFrom = moment(dateFrom),
                    momentTo = moment(dateTo),
                    diff = momentFrom.diff(momentTo),
                    data = moment.duration(diff)["_data"];
                    
                console.log(format(data));
            });
            
            emitter.on('error', function(error) {
                console.error(error);
            });
            
            emitter.start();
        });
    });
}

program
    .arguments("<fromsha> <tosha>")
    .action(main)
    .parse(process.argv);