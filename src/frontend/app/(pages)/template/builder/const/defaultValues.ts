export const initialHtml = `
<body>
  <div class="welcome">
    <h1>Hello, GrapesJS!</h1>
    <p>This is a simple starter template.</p>
  </div>
  <div id="i3i6y" class="gjs-row">
    <div class="gjs-cell">
      <div zone-name="Zone" id="i5jwf">[ZONE CONTENT]</div>
    </div>
    <div class="gjs-cell">
      <div zone-name="Zone 2" id="ivgif">[ZONE CONTENT]</div>
    </div>
  </div>
</body>
    `;

export const initialCss = `
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
}
h1 {
  color: darkblue;
}
.gjs-row {
  display: table;
  padding: 10px;
  width: 100%;
}
.gjs-cell {
  width: 50%;
  display: table-cell;
  height: 75px;
}
#i5jwf, #ivgif {
  min-height: 80px;
  padding: 4px;
  text-align: center;
}
@media (max-width: 768px) {
  .gjs-cell {
    width: 100%;
    display: block;
  }
}
    `;
