const customColorscale = [
  [0, 'rgb(255, 0, 255)'], [0.2, 'rgb(0, 0, 255)'], [0.4, 'rgb(0, 255, 255)'],
  [0.6, 'rgb(0, 255, 0)'], [0.8, 'rgb(255, 255, 0)'], [1, 'rgb(255, 0, 0)']
];

const layout = {
  title: 'wave_equation_solver',
  xaxis: {title: 'X'},
  yaxis: {title: 'Y'},
};

let contourPlot = {
  z: [],
  type: 'contour',               //'heatmap', // 'contour',
  colorscale: customColorscale,  // 'Jet', 'Viridis
  zmin: 1.0,
  zmax: 0.0,
  colorbar: {
    title: 'Z',
    side: 'right',
  }
};

Plotly.newPlot('contour-plot', [contourPlot], layout);

function initializeZData(t) {
  const size = gridSize;
  const data = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(0);
    }
    data.push(row);
  }
  return data;
}

function annularArr(Array, i, j) {
  let new_i, new_j;
  if (i < 0) {
    new_i = gridSize + i
  } else if (i > gridSize - 1) {
    new_i = i - gridSize
  } else {
    new_i = i
  }
  if (j < 0) {
    new_j = gridSize + j
  } else if (j > gridSize - 1) {
    new_j = j - gridSize
  } else {
    new_j = j
  }
  return Array[new_i][new_j]
}

function fixedArr(Array, i, j) {
  if (i >= 0 && i <= gridSize - 1 && j >= 0 && j <= gridSize - 1) {
    return Array[i][j]
  } else {
    return 0.0
  }
}

let delta_t = Number(document.getElementById('delta_t').value);
let delta_x = Number(document.getElementById('delta_x').value);
let delta_y = delta_x;
let s = Number(document.getElementById('wave_speed').value);
let amplitude = Number(document.getElementById('amplitude').value);
let frequency = Number(document.getElementById('frequency').value);
let point_v0 = Number(document.getElementById('point_v0').value) / Math.sqrt(2);
let point_a = Number(document.getElementById('point_a').value) / Math.sqrt(2);
let point_x0 = Number(document.getElementById('point_x0').value);
let gridSize = parseInt(document.getElementById('grid_size').value);
let contour_minmax = Number(document.getElementById('contour_minmax').value);
let boundary_type = document.getElementById('boundary_type').value;

let s_dt_dx2 = s * s * delta_t * delta_t / delta_x / delta_x;
let s_dt_dy2 = s * s * delta_t * delta_t / delta_y / delta_y;
let s_dt_dx = s * delta_t / delta_x;
let s_dt_dy = s * delta_t / delta_y;
let now_factor = 2 * (1 - (s_dt_dx2 + s_dt_dy2));
let now_factor_4 = 2 - (s_dt_dx2 + s_dt_dy2) / 12 * 30
let t = 0.0;

let stop_flag = false;

let zData = initializeZData(0.0);
let oldZdata = initializeZData(-delta_t);

contourPlot.z = zData;
contourPlot.zmin = -contour_minmax;
contourPlot.zmax = contour_minmax;



function updateParameters() {
  delta_t = Number(document.getElementById('delta_t').value);
  delta_x = Number(document.getElementById('delta_x').value);
  delta_y = delta_x;
  s = Number(document.getElementById('wave_speed').value);
  amplitude = Number(document.getElementById('amplitude').value);
  frequency = Number(document.getElementById('frequency').value);
  point_v0 = Number(document.getElementById('point_v0').value) / Math.sqrt(2);
  point_a = Number(document.getElementById('point_a').value) / Math.sqrt(2);
  point_x0 = parseInt(document.getElementById('point_x0').value);
  gridSize = parseInt(document.getElementById('grid_size').value);
  contour_minmax = Number(document.getElementById('contour_minmax').value);
  boundary_type = document.getElementById('boundary_type').value;
  s_dt_dx2 = s * s * delta_t * delta_t / delta_x / delta_x;
  s_dt_dy2 = s * s * delta_t * delta_t / delta_y / delta_y;
  s_dt_dx = s * delta_t / delta_x;
  s_dt_dy = s * delta_t / delta_y;

  now_factor = 2 * (1 - (s_dt_dx2 + s_dt_dy2));
  now_factor_4 = 2 - (s_dt_dx2 + s_dt_dy2) / 12 * 30
  t = 0.0;

  zData = initializeZData(0.0);
  oldZdata = initializeZData(-delta_t);

  contourPlot.zmin = -contour_minmax;
  contourPlot.zmax = contour_minmax;
}

document.getElementById('stop_button').onclick =
    function() {
  stop_flag = !stop_flag;
}

const reload_event = document.getElementById('reload_button');
reload_event.addEventListener('click', updateParameters);


function updateZData(t, Zdata, oldZdata) {
  const size = gridSize;
  const data = [];

  if (boundary_type == 'absorption') {
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        let value;
        if (i < 2) {
          if (j < 2) {
            value = Zdata[i][j] - s_dt_dx * (Zdata[i][j] - Zdata[i + 1][j]) -
                s_dt_dy * (Zdata[i][j] - Zdata[i][j + 1]);
          } else if (j > gridSize - 3) {
            value = Zdata[i][j] - s_dt_dx * (Zdata[i][j] - Zdata[i + 1][j]) -
                s_dt_dy * (Zdata[i][j] - Zdata[i][j - 1]);
          } else {
            value = Zdata[i][j] - s_dt_dx * (Zdata[i][j] - Zdata[i + 1][j]) -
                s_dt_dy * (Zdata[i][j] - Zdata[i][j - 1])
          }
        } else if (i > gridSize - 3) {
          if (j < 2) {
            value = Zdata[i][j] - s_dt_dx * (Zdata[i][j] - Zdata[i - 1][j]) -
                s_dt_dy * (Zdata[i][j] - Zdata[i][j + 1]);
          } else if (j > gridSize - 3) {
            value = Zdata[i][j] - s_dt_dx * (Zdata[i][j] - Zdata[i - 1][j]) -
                s_dt_dy * (Zdata[i][j] - Zdata[i][j - 1]);
          } else {
            value = Zdata[i][j] - s_dt_dx * (Zdata[i][j] - Zdata[i - 1][j]) -
                s_dt_dy * (Zdata[i][j] - Zdata[i][j - 1])
          }
        } else {
          if (j < 2) {
            value = Zdata[i][j] - s_dt_dy * (Zdata[i][j] - Zdata[i][j + 1]);
            -s_dt_dx * (Zdata[i][j] - Zdata[i - 1][j])
          } else if (j > gridSize - 3) {
            value = Zdata[i][j] - s_dt_dy * (Zdata[i][j] - Zdata[i][j - 1]);
            -s_dt_dy * (Zdata[i][j] - Zdata[i - 1][j])
          } else {
            value = s_dt_dx2 *
                    (-Zdata[i - 2][j] + 16 * Zdata[i - 1][j] +
                     16 * Zdata[i + 1][j] - Zdata[i + 2][j]) +
                s_dt_dy2 *
                    (-Zdata[i][j - 2] + 16 * Zdata[i][j - 1] +
                     16 * Zdata[i][j + 1] - Zdata[i][j + 2]);
            value /= 12;
            value += Zdata[i][j] * now_factor_4 - oldZdata[i][j];
            // value = s_dt_dx2 * (Zdata[i - 1][j] + Zdata[i + 1][j])*p_factor
            //   + s_dt_dy2 * (Zdata[i][j - 1] + Zdata[i][j + 1])*p_factor
            // value += Zdata[i][j] * now_factor - oldZdata[i][j];
          }
        }
        row.push(value);
      }
      data.push(row);
    }
  } else if (boundary_type == 'annular') {
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        let value;
        value = s_dt_dx2 *
                (-annularArr(Zdata, i - 2, j) +
                 16 * annularArr(Zdata, i - 1, j) +
                 16 * annularArr(Zdata, i + 1, j) -
                 annularArr(Zdata, i + 2, j)) +
            s_dt_dy2 *
                (-annularArr(Zdata, i, j - 2) +
                 16 * annularArr(Zdata, i, j - 1) +
                 16 * annularArr(Zdata, i, j + 1) -
                 annularArr(Zdata, i, j + 2));
        value /= 12;
        value += Zdata[i][j] * now_factor_4 - oldZdata[i][j];
        row.push(value);
      }
      data.push(row);
    }
  } else {
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        let value;
        value = s_dt_dx2 *
                (-fixedArr(Zdata, i - 2, j) + 16 * fixedArr(Zdata, i - 1, j) +
                 16 * fixedArr(Zdata, i + 1, j) - fixedArr(Zdata, i + 2, j)) +
            s_dt_dy2 *
                (-fixedArr(Zdata, i, j - 2) + 16 * fixedArr(Zdata, i, j - 1) +
                 16 * fixedArr(Zdata, i, j + 1) - fixedArr(Zdata, i, j + 2));
        value /= 12;
        value += Zdata[i][j] * now_factor_4 - oldZdata[i][j];
        row.push(value);
      }
      data.push(row);
    }
  }

  let now_time = t;
  let now_point =
      point_x0 + point_v0 * now_time + 0.5 * point_a * now_time * now_time;
  let now_floor_point = Math.floor(now_point);
  let now_point_ratio = now_point - now_floor_point;

  console.log(now_point_ratio);
  let now_value = amplitude * Math.sin(-frequency * t);

  data[now_floor_point][now_floor_point] = now_value * (1 - now_point_ratio) +
      now_point_ratio * data[now_floor_point][now_floor_point];
  data[now_floor_point + 1][now_floor_point + 1] = now_value * now_point_ratio +
      (1 - now_point_ratio) * data[now_floor_point + 1][now_floor_point + 1];

  return data;
}


setInterval(function() {
  if (!stop_flag) {
    t += delta_t;
    let newzData = updateZData(t, zData, oldZdata);
    oldZdata = zData
    zData = newzData
    Plotly.restyle('contour-plot', 'z', [zData]);
  }
}, 100);
