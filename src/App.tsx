import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Download, Flower2, Leaf, Music2, VolumeX, Plus, ShieldAlert, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { FlowerPortrait, GardenScene } from './components/GardenScene'
import { createSeed, generateFlowerParams } from './lib/flower'
import { sounds } from './lib/audio'
import { useGardenStore } from './store'
import type { DraftEntry, EmotionType, MindfulEntry } from './types'

type View = 'home' | 'record' | 'growth' | 'garden'
const emotions: EmotionType[] = ['担心','害怕','委屈','羞耻','愤怒','孤独','压力','不确定','其他']
const bodies = ['胸口','喉咙','胃部','肩颈','头部','手心','全身紧绷','说不清']
const practices = [
  {id:'4-6 呼吸', icon:'⌁', title:'4–6 呼吸', text:'吸气 4 秒，呼气 6 秒。让身体慢慢知道，现在可以松一点。'},
  {id:'五感着陆', icon:'◌', title:'五感着陆', text:'看见 5 样，触摸 4 样，听见 3 种，闻到 2 种，感受 1 个呼吸。'},
  {id:'给自己一句话', icon:'“', title:'给自己一句话', text:'对自己说一句此刻真正需要听见的话。'},
  {id:'一个小行动', icon:'→', title:'一个小行动', text:'不是解决全部，只是找到下一步很小、很小的动作。'},
]
const emptyDraft: DraftEntry = {rawText:'',emotionType:'',bodyLocation:'',beforeIntensity:5,strongestThought:'',gentleReframe:'',selectedPractice:'',afterIntensity:4}
const riskPattern = /自杀|自残|不想活|想死|结束生命|伤害自己|伤害别人|杀了|活不下去/

function isMindfulEntry(value: unknown): value is MindfulEntry {
  if(!value||typeof value!=='object')return false
  const entry=value as Record<string,unknown>
  const flower=entry.flowerParams as Record<string,unknown>|undefined
  return typeof entry.id==='string'&&typeof entry.createdAt==='string'&&typeof entry.rawText==='string'&&
    typeof entry.emotionType==='string'&&emotions.includes(entry.emotionType as EmotionType)&&
    typeof entry.beforeIntensity==='number'&&typeof entry.afterIntensity==='number'&&
    typeof entry.flowerSeed==='number'&&!!flower&&typeof flower.petalCount==='number'&&
    typeof flower.bloomColor==='string'&&typeof flower.materialType==='string'&&typeof flower.flowerHeight==='number'
}

function App() {
  const {entries, muted, toggleMuted, addEntry, importEntries, removeEntry, clearEntries} = useGardenStore()
  const [view,setView] = useState<View>('home'); const [selected,setSelected] = useState<MindfulEntry|null>(null)
  const [draft,setDraft] = useState<DraftEntry>(emptyDraft); const [step,setStep] = useState(0); const [newEntry,setNewEntry] = useState<MindfulEntry|null>(null)
  const go = (next: View) => { sounds.click(muted); setView(next); window.scrollTo({top:0,behavior:'smooth'}) }
  const start = () => { setDraft(emptyDraft); setStep(0); go('record') }
  const save = () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; const emotion = draft.emotionType || '其他'
    const seed = createSeed(id,draft.rawText,emotion,draft.beforeIntensity)
    const entry: MindfulEntry = {...draft, id, createdAt:new Date().toISOString(), title:draft.rawText.slice(0,28), emotionType:emotion, flowerSeed:seed,
      flowerParams:generateFlowerParams(seed,emotion,draft.beforeIntensity), note:'', tags:[]}
    addEntry(entry); setNewEntry(entry); go('growth')
  }
  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>go('home')} aria-label="回到首页"><span className="brand-mark"><Leaf size={17}/></span><span>正念花园</span><small>MINDFUL GARDEN</small></button>
      <nav><button className={view==='home'?'active':''} onClick={()=>go('home')}>此刻</button><button className={view==='garden'?'active':''} onClick={()=>go('garden')}>我的花园</button></nav>
      <button className="sound" onClick={toggleMuted} aria-label={muted?'打开声音':'静音'}>{muted?<VolumeX size={17}/>:<Music2 size={17}/>}</button>
    </header>
    <AnimatePresence mode="wait">
      {view==='home' && <Home key="home" entries={entries} start={start} garden={()=>go('garden')} select={setSelected} />}
      {view==='record' && <RecordFlow key="record" draft={draft} setDraft={setDraft} step={step} setStep={setStep} cancel={()=>go('home')} save={save} muted={muted} />}
      {view==='growth' && newEntry && <Growth key="growth" entry={newEntry} muted={muted} done={()=>go('garden')} />}
      {view==='garden' && <Garden key="garden" entries={entries} select={setSelected} start={start} remove={removeEntry} clear={clearEntries} importEntries={importEntries} />}
    </AnimatePresence>
    <AnimatePresence>{selected && <EntryModal entry={selected} close={()=>setSelected(null)} remove={()=>{removeEntry(selected.id);setSelected(null)}} />}</AnimatePresence>
  </div>
}

function Page({children,className=''}:{children:React.ReactNode,className?:string}) {
  return <motion.main className={className} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.42,ease:[.22,1,.36,1]}}>{children}</motion.main>
}

function Home({entries,start,garden,select}:{entries:MindfulEntry[];start:()=>void;garden:()=>void;select:(e:MindfulEntry)=>void}) {
  const latest = entries[0]
  return <Page className="home">
    <div className="hero-scene"><GardenScene entries={entries} onSelect={select} compact /></div>
    <div className="aurora aurora-a"/><div className="aurora aurora-b"/>
    <section className="hero-copy">
      <div className="eyebrow"><span/>你的内在花园</div>
      <h1>把此刻的焦虑，<br/>种成一朵<span>会发光的花。</span></h1>
      <p>也许我们可以先停一下。不急着解决全部，只是轻轻看见此刻正在发生什么。</p>
      <div className="hero-actions"><button className="primary" onClick={start}><Plus size={18}/>记录此刻</button><button className="secondary" onClick={garden}>走进花园 <ArrowRight size={17}/></button></div>
      <div className="stats"><div><strong>{String(entries.length).padStart(2,'0')}</strong><span>朵被看见的花</span></div><i/><div><strong>{latest?new Date(latest.createdAt).toLocaleDateString('zh-CN',{month:'short',day:'numeric'}):'等待你'}</strong><span>最近一次照顾</span></div></div>
    </section>
    {entries.length===0 && <div className="empty-whisper"><Sparkles size={14}/>花园里有一些微光，等待你的第一朵花</div>}
    <div className="safety-line"><ShieldAlert size={14}/>用于自我觉察与放松，不替代专业心理咨询或医疗建议。</div>
  </Page>
}

function RecordFlow({draft,setDraft,step,setStep,cancel,save,muted}:{draft:DraftEntry;setDraft:(d:DraftEntry)=>void;step:number;setStep:(n:number)=>void;cancel:()=>void;save:()=>void;muted:boolean}) {
  const [practicePhase,setPracticePhase] = useState<'select'|'guide'|'rate'>('select')
  const change = <K extends keyof DraftEntry>(key:K,value:DraftEntry[K]) => setDraft({...draft,[key]:value})
  const risky = riskPattern.test(`${draft.rawText} ${draft.strongestThought}`)
  const canNext = [draft.rawText.trim().length>1,!!draft.emotionType,!!draft.bodyLocation,true,draft.strongestThought.trim().length>0 && draft.gentleReframe.trim().length>0,!!draft.selectedPractice][step]
  const next = () => { sounds.click(muted); if(step<5)setStep(step+1);else if(practicePhase==='select')setPracticePhase('guide');else if(practicePhase==='rate')save() }
  const back = () => { if(step===5&&practicePhase!=='select'){setPracticePhase('select');return} if(step)setStep(step-1);else cancel() }
  return <Page className="flow-page">
    <div className="flow-head"><button className="back-link" onClick={back}><ArrowLeft size={16}/>{step?'上一步':'暂时离开'}</button><span>{step+1} / 6</span></div>
    <div className="progress"><motion.span animate={{width:`${(step+1)/6*100}%`}} /></div>
    <AnimatePresence mode="wait"><motion.section className="flow-card" key={step} initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}} transition={{duration:.36,ease:[.22,1,.36,1]}}>
      {step===0 && <><Kicker n="01" text="停下来"/><h2>先不用急着解决它。</h2><p className="lead">我们只需要把它轻轻放到这里。此刻，你愿意给这个感受一个名字吗？</p><label>现在让你感到焦虑的事情是什么？</label><textarea autoFocus value={draft.rawText} onChange={e=>change('rawText',e.target.value)} placeholder="例如：我担心工作没有做好 / 我不知道未来会怎样……" maxLength={500}/>{risky&&<CrisisCard/>}</>}
      {step===1 && <><Kicker n="02" text="情绪命名"/><h2>这个感受，更接近哪一种？</h2><p className="lead">不用寻找最准确的答案。选择此刻最靠近你的那个词就好。</p><div className="choice-grid emotions">{emotions.map(x=><button key={x} className={draft.emotionType===x?'chosen':''} onClick={()=>change('emotionType',x)}>{x}<span/></button>)}</div></>}
      {step===2 && <><Kicker n="03" text="身体觉察"/><h2>身体的哪里，最有感觉？</h2><p className="lead">焦虑常常不只在脑海里，也会悄悄出现在身体里。只是留意，不需要改变它。</p><div className="choice-grid bodies">{bodies.map(x=><button key={x} className={draft.bodyLocation===x?'chosen':''} onClick={()=>change('bodyLocation',x)}>{x}</button>)}</div></>}
      {step===3 && <><Kicker n="04" text="感受强度"/><h2>此刻，大概是几分？</h2><p className="lead">0 是平静，10 是非常强烈。这里没有“应该”是多少。</p><Intensity value={draft.beforeIntensity} onChange={v=>change('beforeIntensity',v)}/></>}
      {step===4 && <><Kicker n="05" text="温柔地看见想法"/><h2>让想法只是想法。</h2><p className="lead">我们不需要立刻相信每一个念头。可以试着说：“我注意到，我正在有一个想法……”</p><label>脑海里最强烈的那个想法是什么？</label><textarea value={draft.strongestThought} onChange={e=>change('strongestThought',e.target.value)} placeholder="我注意到，我正在担心……"/><label>有没有一个更温柔、更贴近现实的说法？</label><textarea value={draft.gentleReframe} onChange={e=>change('gentleReframe',e.target.value)} placeholder="我正在经历担心，但这不代表事情一定会变糟……"/>{risky&&<CrisisCard/>}</>}
      {step===5 && practicePhase==='select' && <><Kicker n="06" text="一个小练习"/><h2>陪自己，在这里多停一会儿。</h2><p className="lead">选一个此刻愿意尝试的小练习。我们会一步一步来，不需要做得完美。</p><div className="practice-grid">{practices.map(p=><button key={p.id} className={draft.selectedPractice===p.id?'chosen':''} onClick={()=>change('selectedPractice',p.id)}><b>{p.icon}</b><span><strong>{p.title}</strong><small>{p.text}</small></span></button>)}</div></>}
      {step===5 && practicePhase==='guide' && <PracticeGuide practice={draft.selectedPractice} muted={muted} onDone={()=>setPracticePhase('rate')} />}
      {step===5 && practicePhase==='rate' && <><Kicker n="06" text="再次感受"/><h2>此刻，身体和心里有什么变化？</h2><p className="lead">不需要一定变轻。只是再次靠近这个感受，看看它现在大约是多少。</p><div className="after standalone"><label>练习之后，此刻的焦虑强度是多少？</label><Intensity value={draft.afterIntensity} onChange={v=>change('afterIntensity',v)}/></div></>}
      {!(step===5&&practicePhase==='guide') && <div className="flow-actions"><button className="primary" disabled={!canNext} onClick={next}>{step===5?(practicePhase==='select'?'开始这个练习':'把它种成一朵花'):'继续'}<ArrowRight size={17}/></button></div>}
    </motion.section></AnimatePresence>
  </Page>
}

function Kicker({n,text}:{n:string;text:string}) { return <div className="card-kicker"><span>{n}</span>{text}</div> }
function Intensity({value,onChange}:{value:number;onChange:(v:number)=>void}) { return <div className="intensity"><div className="intensity-number"><strong>{value}</strong><span>/ 10</span></div><input aria-label="焦虑强度" type="range" min="0" max="10" value={value} onChange={e=>onChange(+e.target.value)} style={{'--range':`${value*10}%`} as React.CSSProperties}/><div className="scale"><span>平静</span><span>很强烈</span></div></div> }
function CrisisCard(){return <div className="crisis"><ShieldAlert/><div><strong>此刻，先让现实中的人陪你。</strong><p>如果你有伤害自己或他人的冲动，请立即联系当地紧急服务，或告诉一位你信任的人，并尽量不要独处。花园可以等，安全更重要。</p></div></div>}

const guideSteps: Record<string, {title:string;text:string}[]> = {
  '五感着陆': [
    {title:'看见 5 样东西',text:'让目光慢慢停在周围。留意颜色、形状和光线。'},
    {title:'触摸 4 样东西',text:'感受衣物、座椅或手边物品的温度与质地。'},
    {title:'听见 3 种声音',text:'把远处和近处的声音都轻轻收进来。'},
    {title:'闻到 2 种气味',text:'不必特别明显，只是留意空气此刻的味道。'},
    {title:'感受 1 个呼吸',text:'不改变呼吸，只陪它完整地来，再完整地离开。'},
  ],
  '给自己一句话': [
    {title:'把手放在舒服的位置',text:'可以是胸口、手臂，也可以只是让双手自然放松。'},
    {title:'想象正在安慰一位朋友',text:'如果是你关心的人正在经历这一刻，你会怎样对他说？'},
    {title:'把这句话留给自己',text:'在心里缓慢说一遍。此刻的你，也值得被这样对待。'},
  ],
  '一个小行动': [
    {title:'先放下“解决全部”',text:'我们只寻找一个五分钟内可以开始的动作。'},
    {title:'让动作再小一点',text:'小到不需要鼓起很大的勇气，例如喝一口水、写下一句话。'},
    {title:'为它留一个位置',text:'想一想：你愿意在什么时候、从哪里开始这个小动作？'},
  ],
}

function PracticeGuide({practice,muted,onDone}:{practice:string;muted:boolean;onDone:()=>void}) {
  if(practice==='4-6 呼吸') return <BreathingGuide muted={muted} onDone={onDone}/>
  return <StepGuide practice={practice} onDone={onDone}/>
}

function BreathingGuide({muted,onDone}:{muted:boolean;onDone:()=>void}) {
  const [phase,setPhase]=useState<'inhale'|'exhale'|'done'>('inhale'); const [cycle,setCycle]=useState(1); const [seconds,setSeconds]=useState(4)
  useEffect(()=>{
    if(phase==='done')return
    const duration=phase==='inhale'?4:6; setSeconds(duration)
    const tick=window.setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000)
    const change=window.setTimeout(()=>{
      if(phase==='inhale')setPhase('exhale')
      else if(cycle<3){setCycle(c=>c+1);setPhase('inhale')}
      else {setPhase('done');sounds.bloom(muted)}
    },duration*1000)
    return()=>{clearInterval(tick);clearTimeout(change)}
  },[phase,cycle,muted])
  return <div className="guided-practice"><Kicker n="06" text="4–6 呼吸"/><h2>{phase==='done'?'让这一刻，停留一会儿。':phase==='inhale'?'慢慢吸气':'更慢地呼气'}</h2><p className="lead">{phase==='done'?'你完成了三个呼吸循环。无需判断效果，只需要再次感受自己。':`第 ${cycle} / 3 个呼吸 · ${seconds} 秒`}</p><div className={`breath-field ${phase}`}><div className="breath-orbit orbit-a"/><div className="breath-orbit orbit-b"/><div className="breath-core"><span>{phase==='done'?<Check size={28}/>:seconds}</span><small>{phase==='inhale'?'吸气':phase==='exhale'?'呼气':'完成'}</small></div></div>{phase==='done'&&<button className="primary guide-next" onClick={onDone}>再次感受焦虑强度 <ArrowRight size={17}/></button>}</div>
}

function StepGuide({practice,onDone}:{practice:string;onDone:()=>void}) {
  const steps=guideSteps[practice]||guideSteps['一个小行动']; const [index,setIndex]=useState(0); const current=steps[index]
  const advance=()=>{if(index<steps.length-1)setIndex(index+1);else onDone()}
  return <div className="guided-practice"><Kicker n="06" text={practice}/><h2>{current.title}</h2><p className="lead">{current.text}</p><div className="grounding-visual"><div className="grounding-ripple r1"/><div className="grounding-ripple r2"/><div className="grounding-ripple r3"/><span>{index+1}</span></div><div className="guide-dots">{steps.map((_,i)=><span key={i} className={i<=index?'active':''}/>)}</div><button className="primary guide-next" onClick={advance}>{index===steps.length-1?'完成练习':'完成这一小步'}<ArrowRight size={17}/></button></div>
}

function Growth({entry,muted,done}:{entry:MindfulEntry;muted:boolean;done:()=>void}) {
  const [stage,setStage] = useState(0); const soundStage = useRef(-1)
  const labels=['一颗微光的种子，正在落下','茎在安静地长出','叶片开始舒展','花瓣一层层醒来','花蕊亮起了微光','你的花，已经来到花园']
  const stageChange=(s:number)=>{setStage(s);if(s!==soundStage.current){if(s===0)sounds.seed(muted);if(s===4)sounds.bloom(muted);soundStage.current=s}}
  return <Page className="growth-page"><div className="growth-canvas"><FlowerPortrait entry={entry} growth onGrowthStage={stageChange}/></div><div className="growth-overlay"><div className="eyebrow"><span/>种植仪式</div><AnimatePresence mode="wait"><motion.p key={stage} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{labels[stage]}</motion.p></AnimatePresence>{stage>=5&&<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}><h2>你刚刚把一份焦虑，<br/>种成了一朵花。</h2><button className="primary" onClick={done}>去花园看看 <ArrowRight size={17}/></button></motion.div>}</div></Page>
}

function Garden({entries,select,start,remove,clear,importEntries}:{entries:MindfulEntry[];select:(e:MindfulEntry)=>void;start:()=>void;remove:(id:string)=>void;clear:()=>void;importEntries:(entries:MindfulEntry[])=>void}) {
  const [filter,setFilter]=useState<'全部'|EmotionType>('全部'); const [confirm,setConfirm]=useState(false); const [notice,setNotice]=useState(''); const fileRef=useRef<HTMLInputElement>(null)
  const filtered=useMemo(()=>filter==='全部'?entries:entries.filter(e=>e.emotionType===filter),[entries,filter])
  const exportJson=()=>{
    const payload={app:'Mindful Garden',version:1,exportedAt:new Date().toISOString(),entries}
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})); const anchor=document.createElement('a')
    anchor.href=url;anchor.download=`mindful-garden-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url);setNotice(`已导出 ${entries.length} 条记录`)
  }
  const importJson=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return
    try{
      if(file.size>5*1024*1024)throw new Error('文件过大')
      const parsed:unknown=JSON.parse(await file.text()); const candidate=Array.isArray(parsed)?parsed:(parsed&&typeof parsed==='object'?(parsed as {entries?:unknown}).entries:null)
      if(!Array.isArray(candidate))throw new Error('没有记录数组')
      const valid=candidate.filter(isMindfulEntry);if(!valid.length&&candidate.length)throw new Error('记录格式不兼容')
      importEntries(valid);setNotice(`已导入 ${valid.length} 条记录${valid.length<candidate.length?'，忽略了不兼容项目':''}`)
    }catch{setNotice('导入失败：请选择由正念花园导出的 JSON 文件')}
  }
  return <Page className="garden-page"><section className="garden-title"><div><div className="eyebrow"><span/>你的内在风景</div><h1>每一次看见，<br/>都在这里<span>悄悄生长。</span></h1></div><div className="garden-summary"><strong>{entries.length}</strong><span>朵独一无二的花</span></div></section>
    <div className="garden-stage"><GardenScene entries={filtered} onSelect={select}/><div className="stage-hint"><span className="mouse"/>拖动旋转 · 双指缩放 · 轻触花朵查看记录</div></div>
    <section className="garden-tools"><div className="filters"><button className={filter==='全部'?'chosen':''} onClick={()=>setFilter('全部')}>全部</button>{emotions.map(e=><button key={e} className={filter===e?'chosen':''} onClick={()=>setFilter(e)}>{e}</button>)}</div><div className="data-actions"><input ref={fileRef} type="file" accept=".json,application/json" onChange={importJson}/><button className="tool-button" onClick={()=>fileRef.current?.click()}><Upload size={15}/>导入</button><button className="tool-button" onClick={exportJson}><Download size={15}/>导出</button><button className="primary small" onClick={start}><Plus size={16}/>种一朵新花</button></div></section>
    <AnimatePresence>{notice&&<motion.button className="data-notice" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} onClick={()=>setNotice('')}><Check size={15}/>{notice}<X size={13}/></motion.button>}</AnimatePresence>
    {entries.length===0?<section className="garden-empty"><Flower2/><h3>第一朵花，还在等你。</h3><p>你不需要准备好。只需要从此刻真实的感受开始。</p><button className="secondary" onClick={start}>记录此刻</button></section>:
    <section className="history"><div className="section-head"><div><small>GARDEN ARCHIVE</small><h2>花园记忆</h2></div><button className="danger-link" onClick={()=>setConfirm(true)}>清空花园</button></div><div className="history-grid">{filtered.map(e=><article key={e.id} onClick={()=>select(e)}><div className="date"><CalendarDays size={14}/>{new Date(e.createdAt).toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'})}</div><h3>{e.title}</h3><div className="entry-meta"><span>{e.emotionType}</span><span>{e.beforeIntensity} → {e.afterIntensity}</span></div><button aria-label="删除" onClick={ev=>{ev.stopPropagation();remove(e.id)}}><Trash2 size={15}/></button></article>)}</div></section>}
    <AnimatePresence>{confirm&&<Confirm title="要清空整座花园吗？" text="所有花朵和记录都会从这台设备上永久移除。这个动作无法撤销。" cancel={()=>setConfirm(false)} confirm={()=>{clear();setConfirm(false)}}/>}</AnimatePresence>
  </Page>
}

function EntryModal({entry,close,remove}:{entry:MindfulEntry;close:()=>void;remove:()=>void}) {
  const [confirm,setConfirm]=useState(false)
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&close()}><motion.div className="liquid-modal" initial={{opacity:0,scale:.94,y:24}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96,y:16}} transition={{type:'spring',damping:28,stiffness:260}}><button className="modal-close" onClick={close}><X/></button><div className="portrait"><FlowerPortrait entry={entry}/><div className="portrait-hint">拖动观察 · 双指缩放</div><div className="flower-name"><small>{entry.flowerParams.materialType.toUpperCase()} · SEED {entry.flowerSeed.toString(16).slice(0,6).toUpperCase()}</small><strong>{entry.emotionType}之花</strong></div></div><div className="entry-detail"><div className="entry-date">{new Date(entry.createdAt).toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div><h2>“{entry.rawText}”</h2><div className="detail-tags"><span>{entry.emotionType}</span><span>{entry.bodyLocation}</span><span>强度 {entry.beforeIntensity} → {entry.afterIntensity}</span></div><blockquote>那一刻并不容易。但你停了下来，看见了它，也照顾了自己。</blockquote><dl><div><dt>当时最强烈的想法</dt><dd>{entry.strongestThought}</dd></div><div><dt>更温柔、现实的说法</dt><dd>{entry.gentleReframe}</dd></div><div><dt>选择的练习</dt><dd>{entry.selectedPractice}</dd></div></dl><button className="danger-link" onClick={()=>setConfirm(true)}><Trash2 size={14}/>移除这朵花</button></div>{confirm&&<Confirm title="移除这朵花吗？" text="这条记录也会一起从本地删除。" cancel={()=>setConfirm(false)} confirm={remove}/>}</motion.div></motion.div>
}

function Confirm({title,text,cancel,confirm}:{title:string;text:string;cancel:()=>void;confirm:()=>void}) {return <motion.div className="confirm-wrap" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="confirm" initial={{scale:.95}} animate={{scale:1}}><h3>{title}</h3><p>{text}</p><div><button className="secondary" onClick={cancel}>先保留</button><button className="danger" onClick={confirm}>确认移除</button></div></motion.div></motion.div>}

export default App
