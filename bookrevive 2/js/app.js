const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const S={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const money=n=>'$'+Number(n).toFixed(2);
const CATS=['Fiction','Non-Fiction','Children','Study & Uni','Professional','Multilingual'];
const SEED=[[1,'The Midnight Library','Matt Haig','Fiction',24.99,0,18],[2,'Normal People','Sally Rooney','Fiction',22.99,15,12],[3,'Project Hail Mary','Andy Weir','Fiction',26.99,20,9],[4,'Atomic Habits','James Clear','Non-Fiction',29.99,10,25],[5,'Sapiens','Yuval Noah Harari','Non-Fiction',27.99,0,14],[6,'Educated','Tara Westover','Non-Fiction',24.99,25,7],[7,'The Gruffalo','Julia Donaldson','Children',14.99,0,30],[8,'Where the Wild Things Are','Maurice Sendak','Children',16.99,10,20],[9,'The Wonky Donkey','Craig Smith','Children',12.99,30,3],[10,'Campbell Biology','Urry et al.','Study & Uni',129,12,6],[11,'Introduction to Algorithms','Cormen et al.','Study & Uni',119,0,5],[12,'Financial Accounting','Weygandt et al.','Study & Uni',99,15,8],[13,'Clean Code','Robert C. Martin','Professional',59.99,10,11],[14,'The Lean Startup','Eric Ries','Professional',32.99,0,16],[15,'Godan (Hindi)','Premchand','Multilingual',18.99,0,10],[16,'To Live 活着 (Chinese)','Yu Hua','Multilingual',21.99,5,8],[17,'Muna Madan (Nepali)','L. P. Devkota','Multilingual',15.99,0,6],[18,'Blind Date with a Book','Wrapped mystery read','Fiction',14,0,40]].map(([id,title,author,cat,price,off,stock])=>({id,title,author,cat,price,off,stock}));
const CODES={WELCOME10:{p:10},RAINY15:{p:15},STUDENT10:{p:10},SPIN5:{p:5},SPIN15:{p:15},REVIVE5:{a:5}};
const books=()=>{let b=S.get('br_books');if(!b){b=SEED;S.set('br_books',b)}return b};
const sale=b=>b.price*(1-b.off/100);
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const me=()=>S.get('br_session',null);
const users=()=>S.get('br_users',[]);
async function seedAdmin(){if(!users().some(u=>u.role==='admin'))S.set('br_users',[...users(),{name:'Store Admin',email:'admin@bookrevive.com',pass:await sha('admin123'),role:'admin',points:0,joined:Date.now()}])}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2600)}
function layout(){
 const u=me();
 document.body.insertAdjacentHTML('afterbegin',`<header class="nav"><a class="brand" href="index.html"><img src="assets/logo.png" alt="BookRevive"></a><nav><a class="hm" href="index.html#shop">Shop</a><a class="hm" href="index.html#offers">Offers</a><a class="hm" href="index.html#events">Events</a>${u?`${u.role==='admin'?'<a href="admin.html">Dashboard</a>':`<span>⭐ ${u.points} pts</span>`}<a href="#" id="out">Log out</a>`:'<a href="login.html">Log in</a><a class="btn s" href="signup.html">Sign up</a>'}<a href="#" id="cartBtn">🛒 <span id="cc">0</span></a></nav></header>
 <aside class="drawer" id="drawer"><div class="row"><h3>Your basket</h3><a href="#" id="x">✕</a></div><div class="items" id="items"></div><input id="code" placeholder="Promo code"><label style="font-size:.85rem"><input type="radio" name="m" value="Home delivery" checked style="width:auto"> Home delivery &nbsp; <input type="radio" name="m" value="Click & collect (Parramatta)" style="width:auto"> Click &amp; collect</label><div id="tot"></div><button class="btn" id="buy">Place order</button></aside>`);
 document.body.insertAdjacentHTML('beforeend',`<footer><div class="wrap"><span>© 2026 BookRevive · Local Books Bookstore Pty Ltd · Parramatta, NSW 2150</span><span>Powered by <b>InnovateX Consultants</b></span></div></footer>`);
 $('#out')?.addEventListener('click',e=>{e.preventDefault();localStorage.removeItem('br_session');location='index.html'});
 $('#cartBtn').onclick=e=>{e.preventDefault();$('#drawer').classList.add('open');drawCart()};
 $('#x').onclick=e=>{e.preventDefault();$('#drawer').classList.remove('open')};
 $('#code').oninput=drawCart;$('#buy').onclick=checkout;cartCount();
}
const cart=()=>S.get('br_cart',[]);
function cartCount(){$('#cc').textContent=cart().reduce((a,i)=>a+i.q,0)}
function add(id){const b=books().find(x=>x.id===id),c=cart(),i=c.find(x=>x.id===id);if(b.stock<=(i?i.q:0))return toast('No more stock available');i?i.q++:c.push({id,q:1});S.set('br_cart',c);cartCount();toast('Added to basket')}
function qty(id,d){let c=cart();const i=c.find(x=>x.id===id);i.q+=d;c=c.filter(x=>x.q>0);S.set('br_cart',c);cartCount();drawCart()}
function totals(){const bs=books();let sub=0;cart().forEach(i=>{const b=bs.find(x=>x.id===i.id);if(b)sub+=sale(b)*i.q});const c=CODES[$('#code')?.value.trim().toUpperCase()];const d=c?(c.p?sub*c.p/100:Math.min(c.a,sub)):0;return{sub,d,total:sub-d}}
function drawCart(){const bs=books(),t=totals();$('#items').innerHTML=cart().map(i=>{const b=bs.find(x=>x.id===i.id);return `<div class="ci"><span>${b.title}<br><small>${money(sale(b))}</small></span><span><button onclick="qty(${i.id},-1)">−</button> ${i.q} <button onclick="qty(${i.id},1)">+</button></span></div>`}).join('')||'<p class="sub">Your basket is empty.</p>';$('#tot').innerHTML=`<small>Subtotal ${money(t.sub)}${t.d?` · Promo −${money(t.d)}`:''}</small><h3>Total ${money(t.total)}</h3><small>You’ll earn ${Math.floor(t.total)} loyalty points</small>`}
function checkout(){const u=me();if(!cart().length)return toast('Basket is empty');if(!u)return location='login.html?next=index.html';payModal()}
function finish(pay){const u=me(),t=totals(),bs=books();cart().forEach(i=>bs.find(b=>b.id===i.id).stock-=i.q);S.set('br_books',bs);
 const o=S.get('br_orders',[]);o.unshift({id:'BR'+(1000+o.length+1),email:u.email,items:cart().reduce((a,i)=>a+i.q,0),total:t.total,method:$('input[name=m]:checked').value,pay,date:Date.now()});S.set('br_orders',o);
 const us=users(),x=us.find(a=>a.email===u.email);x.points+=Math.floor(t.total);S.set('br_users',us);S.set('br_session',{...u,points:x.points});S.set('br_cart',[]);toast('Order '+o[0].id+' placed! Points added 🎉');setTimeout(()=>location.reload(),1500)}
function card(b){return `<div class="card"><div class="cover" style="background:hsl(${b.id*47%360},32%,42%)">${b.off?`<span class="badge">−${b.off}%</span>`:''}${b.title}</div><h3>${b.title}</h3><small>${b.author} · ${b.cat}</small>${b.stock<=5?`<div class="low">Only ${b.stock} left</div>`:''}<div class="row"><span>${b.off?`<span class="old">${money(b.price)}</span>`:''}<b>${money(sale(b))}</b></span><button class="btn s" ${b.stock?'':'disabled'} onclick="add(${b.id})">${b.stock?'Add':'Sold out'}</button></div></div>`}
function shop(){
 let cat='All';const bs=books(),max=Math.ceil(Math.max(...bs.map(b=>b.price))/10)*10;
 $('#chips').innerHTML=['All',...CATS].map(c=>`<button class="chip ${c=='All'?'on':''}">${c}</button>`).join('');
 $('#pr').max=max;$('#pr').value=max;
 const draw=()=>{const q=$('#q').value.toLowerCase(),m=+$('#pr').value;$('#pv').textContent='≤ $'+m;
  let l=books().filter(b=>(cat=='All'||b.cat==cat)&&sale(b)<=m&&(!$('#so').checked||b.off)&&(b.title+b.author).toLowerCase().includes(q));
  const s=$('#sort').value;l.sort((a,b)=>s=='lo'?sale(a)-sale(b):s=='hi'?sale(b)-sale(a):s=='az'?a.title.localeCompare(b.title):b.off-a.off);
  $('#grid').innerHTML=l.map(card).join('')||'<p class="sub">No books match. Try loosening the filters.</p>'};
 $$('#chips .chip').forEach(c=>c.onclick=()=>{$$('#chips .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');cat=c.textContent;draw()});
 ['q','pr','so','sort'].forEach(i=>$('#'+i).addEventListener('input',draw));
 $$('.mood').forEach(m=>m.onclick=()=>{cat=m.dataset.c;$$('#chips .chip').forEach(x=>x.classList.toggle('on',x.textContent==cat));draw();$('#shop').scrollIntoView()});
 draw();
 $('#spinBtn').onclick=()=>{const d=new Date().toDateString();if(S.get('br_spin')===d)return toast('One spin per day — come back tomorrow!');S.set('br_spin',d);
  const P=[['SPIN5','5% off your basket'],['SPIN15','15% off — jackpot!'],['REVIVE5','$5 off any order'],['SPIN5','5% off your basket']],p=P[Math.floor(Math.random()*P.length)];
  $('#spin').style.transform=`rotate(${1080+Math.random()*360}deg)`;setTimeout(()=>$('#prize').innerHTML=`You won: ${p[1]}<br>Code <b>${p[0]}</b> — paste it in your basket`,1400)}
}
function authForm(mode){
 $('form').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),err=$('.err'),email=f.email.trim().toLowerCase(),us=users();
  if(mode=='signup'){if(f.pass.length<6)return err.textContent='Password must be at least 6 characters';if(us.some(u=>u.email==email))return err.textContent='That email is already registered';
   const u={name:f.name.trim(),email,pass:await sha(f.pass),role:'member',points:100,joined:Date.now()};S.set('br_users',[...us,u]);S.set('br_session',u);location='index.html'}
  else{const h=await sha(f.pass),u=us.find(u=>u.email==email&&u.pass==h);if(!u)return err.textContent='Incorrect email or password';S.set('br_session',u);location=u.role=='admin'?'admin.html':(new URLSearchParams(location.search).get('next')||'index.html')}}
}
function admin(){
 const u=me();if(!u||u.role!=='admin'){location='login.html';return}
 const draw=()=>{const bs=books(),o=S.get('br_orders',[]),us=users().filter(x=>x.role!='admin');
  $('#st').innerHTML=[['Revenue',money(o.reduce((a,x)=>a+x.total,0))],['Orders',o.length],['Titles',bs.length],['Stock units',bs.reduce((a,b)=>a+b.stock,0)],['Low stock',bs.filter(b=>b.stock<=5).length],['Members',us.length]].map(([k,v])=>`<div class="card"><small>${k}</small><b>${v}</b></div>`).join('');
  $('#inv').innerHTML=bs.map(b=>`<tr><td>${b.title}</td><td>${b.cat}</td><td>${money(b.price)}</td><td><input type="number" min="0" max="90" value="${b.off}" onchange="upd(${b.id},'off',this.value)">%</td><td><input type="number" min="0" value="${b.stock}" onchange="upd(${b.id},'stock',this.value)"></td><td><button class="btn s o" onclick="del(${b.id})">Delete</button></td></tr>`).join('');
  $('#ord').innerHTML=o.map(x=>`<tr><td>${x.id}</td><td>${x.email}</td><td>${x.items}</td><td>${money(x.total)}</td><td>${x.method}</td><td>${x.pay||'—'}</td><td>${new Date(x.date).toLocaleDateString('en-AU')}</td></tr>`).join('')||'<tr><td colspan=7>No orders yet.</td></tr>';
  $('#mem').innerHTML=us.map(x=>`<tr><td>${x.name}</td><td>${x.email}</td><td>${x.points}</td><td>${new Date(x.joined).toLocaleDateString('en-AU')}</td></tr>`).join('')||'<tr><td colspan=4>No members yet.</td></tr>'};
 window.upd=(id,k,v)=>{const bs=books();bs.find(b=>b.id==id)[k]=+v;S.set('br_books',bs);draw()};
 window.del=id=>{if(confirm('Delete this title?')){S.set('br_books',books().filter(b=>b.id!=id));draw()}};
 $('#cat').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
 $('#add').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),bs=books();bs.push({id:Math.max(0,...bs.map(b=>b.id))+1,title:f.title,author:f.author,cat:f.cat,price:+f.price,off:+f.off||0,stock:+f.stock});S.set('br_books',bs);e.target.reset();draw();toast('Book added')};
 draw();
}

const luhn=n=>{let s=0,d=false;for(let i=n.length-1;i>=0;i--){let c=+n[i];if(d){c*=2;if(c>9)c-=9}s+=c;d=!d}return s%10==0};
function payModal(){const t=totals(),pk=$('input[name=m]:checked').value.startsWith('Click');
 document.body.insertAdjacentHTML('beforeend',`<div id="pm" class="modal"><form class="mbox"><div class="row" style="margin:0"><h3>Payment</h3><a href="#" id="pc">✕</a></div><div class="hint">Demo mode: no real charges. Test card 4242 4242 4242 4242, any future expiry, any CVC.</div><h3>Total ${money(t.total)}</h3>${pk?'<label><input type="radio" name="pt" value="store" style="width:auto"> Pay in store on collection</label>':''}<label><input type="radio" name="pt" value="card" checked style="width:auto"> Credit / debit card</label><div id="cf" style="display:grid;gap:10px"><input name="nm" placeholder="Name on card" autocomplete="off"><input name="cn" placeholder="Card number" inputmode="numeric" maxlength="19" autocomplete="off"><div style="display:flex;gap:10px"><input name="ex" placeholder="MM/YY" maxlength="5" autocomplete="off"><input name="cv" placeholder="CVC" maxlength="4" inputmode="numeric" autocomplete="off"></div></div><div class="err" style="color:#b3261e;font-size:.85rem;min-height:18px"></div><button class="btn" id="pay">Pay ${money(t.total)}</button></form></div>`);
 const f=$('#pm form');$('#pc').onclick=e=>{e.preventDefault();$('#pm').remove()};
 $$('input[name=pt]',f).forEach(r=>r.onchange=()=>$('#cf').style.display=f.querySelector('input[name=pt]:checked').value=='card'?'grid':'none');
 f.elements.cn.oninput=()=>f.elements.cn.value=f.elements.cn.value.replace(/\D/g,'').replace(/(\d{4})(?=\d)/g,'$1 ');
 f.elements.ex.oninput=()=>f.elements.ex.value=f.elements.ex.value.replace(/\D/g,'').replace(/^(\d\d)(?=\d)/,'$1/');
 f.onsubmit=e=>{e.preventDefault();const err=$('.err',f),pt=f.querySelector('input[name=pt]:checked').value;let pay='Pay in store';
  if(pt=='card'){const n=f.elements.cn.value.replace(/\s/g,''),m=f.elements.ex.value.match(/^(\d\d)\/(\d\d)$/);
   if(!f.elements.nm.value.trim())return err.textContent='Enter the name on the card';
   if(!/^\d{13,19}$/.test(n)||!luhn(n))return err.textContent='That card number is not valid';
   if(!m||+m[1]<1||+m[1]>12||new Date(2000+ +m[2],+m[1])<new Date())return err.textContent='Card expired or date invalid';
   if(!/^\d{3,4}$/.test(f.elements.cv.value))return err.textContent='Enter the CVC';pay='Card •••• '+n.slice(-4)}
  $('#pay').disabled=true;$('#pay').textContent='Processing…';setTimeout(()=>{$('#pm').remove();finish(pay)},1200)}}
