var e=`bimo_quiz_scores`,t=`bimo_sheets_webhook_url`,n=()=>{try{let e=localStorage.getItem(t);return e?e.trim():``}catch{return``}},r=e=>{try{return e&&typeof e==`string`?localStorage.setItem(t,e.trim()):localStorage.removeItem(t),!0}catch(e){return console.error(`Gagal menyimpan URL Webhook:`,e),!1}},i=()=>{try{let t=localStorage.getItem(e);if(!t)return[];let n=JSON.parse(t);if(!Array.isArray(n))return[];let r=n.filter(e=>e&&e.id&&!String(e.id).startsWith(`sample_`));return r.length!==n.length&&localStorage.setItem(e,JSON.stringify(r)),r}catch(e){return console.error(`Gagal membaca data nilai dari localStorage:`,e),[]}},a=t=>{try{let n=[t,...i()];return localStorage.setItem(e,JSON.stringify(n)),n}catch(e){return console.error(`Gagal menyimpan nilai secara lokal:`,e),[]}},o=(t,n)=>{try{let r=i().map(e=>e.id===t?{...e,synced:n}:e);return localStorage.setItem(e,JSON.stringify(r)),r}catch(e){return console.error(`Gagal memperbarui status sinkronisasi:`,e),[]}},s=()=>{try{return localStorage.removeItem(e),!0}catch{return!1}},c=async e=>{let t=n();if(!t)return{success:!1,reason:`URL Spreadsheet belum dikonfigurasi oleh guru`};try{return await fetch(t,{method:`POST`,mode:`no-cors`,cache:`no-cache`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}),{success:!0}}catch(e){return console.warn(`Gagal mengirim ke Google Sheets:`,e),{success:!1,error:e.message}}},l=async({student:e=null,modul:t=`Modul Permesinan`,judulKuis:r=`Kuis Evaluasi`,skor:i=0,jawabanBenar:s=0,totalSoal:l=0,detailJawaban:u=null})=>{let d=e;if(!d||!d.name)try{let e=localStorage.getItem(`bimo_student_session`);e&&(d=JSON.parse(e))}catch{}let f=d?.name||`Siswa Praktikan`,p=d?.studentNumber||`-`,m=d?.className||`X TPM`,h=d?.school||`SMK / Poltek`,g=new Date,_=g.toLocaleDateString(`id-ID`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})+`, `+g.toLocaleTimeString(`id-ID`,{hour:`2-digit`,minute:`2-digit`})+` WIB`,v=Math.round(Number(i)||0),y=v>=75?`LULUS`:`REMEDIAL`,b={id:`quiz_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,timestamp:g.toISOString(),waktu:_,namaSiswa:f,nomorAbsen:p,kelas:m,sekolah:h,modul:t,judulKuis:r,skor:v,jawabanBenar:Number(s)||0,totalSoal:Number(l)||0,status:y,detailJawaban:typeof u==`object`?JSON.stringify(u):u||`-`,synced:!1};a(b);let x={success:!1};n()&&(x=await c(b),x.success&&o(b.id,!0));try{window.dispatchEvent(new CustomEvent(`bimo:quiz_submitted`,{detail:{record:b,sheetResult:x}}))}catch{}return{record:b,sheetResult:x}},u=async()=>{let e=i().filter(e=>!e.synced);if(e.length===0)return{total:0,synced:0};let t=0;for(let n of e)(await c(n)).success&&(o(n.id,!0),t++);return{total:e.length,synced:t}},d=(e=null)=>{let t=e||i();if(!t||t.length===0){alert(`Belum ada data nilai yang tercatat untuk diekspor.`);return}let n=[`Waktu / Tanggal`,`Nama Siswa`,`No. Absen`,`Kelas`,`Sekolah / Instansi`,`Modul Lab`,`Nama Kuis`,`Nilai (0-100)`,`Jawaban Benar`,`Total Soal`,`Status`,`Tersinkron Spreadsheet`,`Rincian Jawaban`],r=e=>e==null?`""`:`"${String(e).replace(/"/g,`""`)}"`,a=t.map(e=>[r(e.waktu),r(e.namaSiswa),r(e.nomorAbsen),r(e.kelas),r(e.sekolah),r(e.modul),r(e.judulKuis),r(e.skor),r(e.jawabanBenar),r(e.totalSoal),r(e.status),r(e.synced?`SUDAH`:`BELUM`),r(e.detailJawaban)].join(`,`)),o=`﻿`+[n.join(`,`),...a].join(`\r
`),s=new Blob([o],{type:`text/csv;charset=utf-8;`}),c=URL.createObjectURL(s),l=document.createElement(`a`);l.href=c,l.download=`Rekap_Nilai_Siswa_BIMO_Lab_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(c)},f=async(e=null)=>{let t=e||i();if(!t||t.length===0)return{success:!1,message:`Tidak ada data nilai untuk disalin.`};let n=[`Waktu / Tanggal`,`Nama Siswa`,`No. Absen`,`Kelas`,`Sekolah`,`Modul Lab`,`Nama Kuis / Asesmen`,`Nilai (0-100)`,`Jawaban Benar`,`Total Soal`,`Status KKM`,`Rincian Jawaban`],r=t.map(e=>[e.waktu||``,e.namaSiswa||``,e.nomorAbsen||``,e.kelas||``,e.sekolah||``,e.modul||``,e.judulKuis||``,e.skor??``,e.jawabanBenar??``,e.totalSoal??``,e.status||``,(e.detailJawaban||``).replace(/\r?\n|\r/g,` `)].join(`	`)),a=[n.join(`	`),...r].join(`
`);try{return await navigator.clipboard.writeText(a),{success:!0,message:`Tabel berhasil disalin! Buka Google Sheets / Excel dan tekan Ctrl+V.`}}catch(e){return console.error(`Clipboard copy failed:`,e),{success:!1,message:`Gagal menyalin otomatis. Silakan gunakan tombol unduh CSV.`}}},p=(e=null)=>{let t=e||i();if(!t||t.length===0){alert(`Belum ada data nilai yang tercatat untuk diekspor.`);return}let n=t.map((e,t)=>`
    <tr style="background-color: ${t%2==0?`#ffffff`:`#f8fafc`};">
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt;">${e.waktu||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; font-weight: bold;">${e.namaSiswa||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: center;">${e.nomorAbsen||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: center;">${e.kelas||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt;">${e.sekolah||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt;">${e.modul||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt;">${e.judulKuis||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: center; font-weight: bold; color: ${e.skor>=75?`#16a34a`:`#dc2626`};">${e.skor??``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: center;">${e.jawabanBenar??``} / ${e.totalSoal??``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 11pt; text-align: center; font-weight: bold; background-color: ${e.status===`LULUS`?`#dcfce7`:`#fee2e2`}; color: ${e.status===`LULUS`?`#166534`:`#991b1b`};">${e.status||``}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 10pt;">${(e.detailJawaban||``).replace(/"/g,`&quot;`)}</td>
    </tr>
  `).join(``),r=`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Rekap Nilai Siswa</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
    </head>
    <body>
      <h2 style="font-family: Arial, sans-serif; color: #0f172a;">LEMBAR REKAPITULASI NILAI SISWA - BIMO MANUFACTURING LABS</h2>
      <p style="font-family: Arial, sans-serif; font-size: 10pt; color: #64748b;">Instansi: SMKN 2 Depok | Guru Pengampu: Bimoro Kusumo, S.Pd. | Tanggal Ekspor: ${new Date().toLocaleDateString(`id-ID`)}</p>
      <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: center;">
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[A] Waktu / Tanggal</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[B] Nama Siswa</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[C] No. Absen</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[D] Kelas</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[E] Sekolah</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[F] Modul Lab</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[G] Nama Kuis</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[H] Nilai (0-100)</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[I] Benar / Total</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[J] Status KKM</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1;">[K] Rincian Jawaban</th>
          </tr>
        </thead>
        <tbody>
          ${n}
        </tbody>
      </table>
    </body>
    </html>
  `,a=new Blob([r],{type:`application/vnd.ms-excel;charset=utf-8;`}),o=URL.createObjectURL(a),s=document.createElement(`a`);s.href=o,s.download=`Rekap_Nilai_Spreadsheet_BIMO_Lab_${new Date().toISOString().slice(0,10)}.xls`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(o)};export{i as a,c,p as i,r as l,f as n,n as o,d as r,l as s,s as t,u};