// Deterministic camera/network simulation; no real uploads.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../static/index.html','utf8');
const elements={};const el=id=>elements[id]??=( {value:id==='duration'?'5000':'',checked:true,prepend(){}} );
let now=0,requests=[],instances=[];
class Recorder{static isTypeSupported(){return true}constructor(){this.state='inactive';instances.push(this)}start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable({data:new Blob(['video'])});this.onstop()}}
const context={document:{getElementById:el,createElement:()=>({})},performance:{now:()=>now},Blob,AbortSignal,MediaRecorder:Recorder,window:{MediaRecorder:Recorder,addEventListener(){}},navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}},setInterval:()=>1,clearInterval(){},fetch:async(path)=>{if(path==='/api/ready')return{ok:true,json:async()=>({model_loaded:true})};return new Promise(resolve=>requests.push(resolve));}};
vm.createContext(context);vm.runInContext(html.split('<script>')[1].split('</script>')[0],context);
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 await flush();await el('enable').onclick();el('start').onclick();
 const finish=()=>{now+=1000;el('finish').onclick()};
 finish();assert.equal(requests.length,1);assert.equal(instances.at(-1).state,'recording');
 finish();finish();assert.equal(requests.length,1);assert.match(el('queueStatus').textContent,/2\/2 waiting/);assert.match(el('status').textContent,/Catching up/);
 requests[0]({ok:true,json:async()=>({text:'first',audio_used:false})});await flush();assert.equal(requests.length,2);assert.equal(instances.at(-1).state,'recording');
 el('stop').onclick();assert.equal(instances.at(-1).state,'inactive');
 requests[1]({ok:false,json:async()=>({error:'offline'})});await flush();assert.equal(requests.length,2);assert.match(el('status').textContent,/discarded/);assert.equal(el('start').disabled,true);
 assert.equal(el('transcript').value,'first');console.log('PASS: overlap, queue bound, serialized uploads, stop, failure clearing, transcript order');
})().catch(e=>{console.error(e);process.exitCode=1});
