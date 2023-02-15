// TESTER = document.getElementById('tester');
//
// Plotly.plot( TESTER, [{
//     x: [1, 2, 3, 4, 5],
//     y: [1, 2, 4, 8, 16] }], {
//     margin: { t: 0 } }, {showSendToCloud:true} );
//

var data = [{
    type: "sankey",
    arrangement: "snap",
    node:{
        label: ["xcvxcv",                 //0
            " yukyj",                     //1
            "sdfscsd",                     //2
            "sdfscsd",                   //3
            "sdfscsd",                   //4
            " sdfs",                //5
            "sdf",                 //6
            "cc",              //7
            "sdfdsf",                             //8
            "werewr"                                //9
            "cvbvcber",                           //10
            "qweqweqwe",                 //11
            "OTP"],                                //12
        x: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3],
        y: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3],
        pad:10}, // 10 Pixels
    link: {
        source: [0, 1, 2, 3, 4, 5, 6, 7, 8, 7,  11],
        target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 10],
        value:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,   1]}
}]

var layout = {"title": "Sankey with manually positioned node"}

Plotly.newPlot('tester', data, layout)

/* Current Plotly.js version */
console.log( Plotly.BUILD );