let numbers=[];
let score=0;


function newGame(){

    numbers=[
        2,2,4,8,
        2,4,8,16,
        4,2,8,4,
        2,4,2,8
    ];


    score=0;

    update();

}




function update(){

    let board=document.getElementById("board");

    board.innerHTML="";


    numbers.forEach((num,index)=>{


        let box=document.createElement("div");


        box.className="tile";


        box.innerText=num;


        box.onclick=function(){

            selectNumber(index);

        };


        board.appendChild(box);


    });


    document.getElementById("score").innerText=score;

}



let first=null;



function selectNumber(index){


    if(first===null){

        first=index;

        document.getElementsByClassName("tile")[index]
        .style.background="#f59e0b";


    }

    else{


        merge(first,index);


        first=null;


    }


}





function merge(a,b){


    if(a===b)
        return;



    if(numbers[a]===numbers[b]){


        numbers[a]=numbers[a]+numbers[b];


        score+=numbers[a];


        numbers.splice(b,1);


        numbers.push(randomNumber());


        document.getElementById("msg").innerText=
        "Great Merge! 🎉";


        update();


    }

    else{


        document.getElementById("msg").innerText=
        "Same numbers select karo";

    }


}




function randomNumber(){

    let values=[2,4,8];

    return values[
        Math.floor(Math.random()*values.length)
    ];

}




newGame();