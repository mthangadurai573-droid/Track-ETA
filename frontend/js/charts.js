let delayChart;
function drawChart(history){
  const ctx=document.getElementById('delayChart'); if(!ctx||typeof Chart==='undefined')return;
  const labels=history.map(x=>x.clock), values=history.map(x=>Number(x.predicted_remaining_minutes ?? x.remaining_journey_minutes ?? x.delay_min ?? 0));
  const minimum=Math.min(...values), maximum=Math.max(...values), range=Math.max(maximum-minimum,0.5), padding=range*0.35;
  if(delayChart)delayChart.destroy();
  delayChart=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Predicted minutes remaining',data:values,tension:0,pointRadius:4,pointHoverRadius:6,borderWidth:3,fill:false}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:500,easing:'easeOutQuart'},plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9db0d0'}},y:{ticks:{color:'#9db0d0'},min:Math.max(0,minimum-padding),max:maximum+padding,title:{display:true,text:'Minutes to predicted arrival',color:'#9db0d0'}}}}});
}
