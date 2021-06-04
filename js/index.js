const width = 1000;
const barWidth = 500;
const height = 500;
const margin = 30;

const yearLable = d3.select('#year');
const countryName = d3.select('#country-name');

const barChart = d3.select('#bar-chart')
            .attr('width', barWidth)
            .attr('height', height);

const scatterPlot  = d3.select('#scatter-plot')
            .attr('width', width)
            .attr('height', height);

const lineChart = d3.select('#line-chart')
            .attr('width', width)
            .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let rParam = 'gdp';
let year = '2000';
let param = 'child-mortality';
let lineParam = 'gdp';
let highlighted = '';
let selected;
let selected_country = 0;

const x = d3.scaleLinear().range([margin*2, width-margin]);
const y = d3.scaleLinear().range([height-margin, margin]);

const xBar = d3.scaleBand().range([margin*2, barWidth-margin]).padding(0.1);
const yBar = d3.scaleLinear().range([height-margin, margin])

const xAxis = scatterPlot.append('g').attr('transform', `translate(0, ${height-margin})`);
const yAxis = scatterPlot.append('g').attr('transform', `translate(${margin*2}, 0)`);

const xLineAxis = lineChart.append('g').attr('transform', `translate(0, ${height-margin})`);
const yLineAxis = lineChart.append('g').attr('transform', `translate(${margin*2}, 0)`);

const xBarAxis = barChart.append('g').attr('transform', `translate(0, ${height-margin})`);
const yBarAxis = barChart.append('g').attr('transform', `translate(${margin*2}, 0)`);

const colorScale = d3.scaleOrdinal().range(['#DD4949', '#39CDA1', '#FD710C', '#A14BE5']);
const radiusScale = d3.scaleSqrt().range([10, 30]);

loadData().then(data => {

    colorScale.domain(d3.set(data.map(d=>d.region)).values());

    d3.select('#range').on('change', function(){ 
        year = d3.select(this).property('value');
        yearLable.html(year);
        updateScattePlot();
        updateBar();
    });

    d3.select('#radius').on('change', function(){ 
        rParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#x').on('change', function(){ 
        xParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#y').on('change', function(){ 
        yParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#param').on('change', function(){ 
        param = d3.select(this).property('value');
        updateBar();
    });

    d3.select('#p').on('change', function(){ 
        lineParam = d3.select(this).property('value');
        //alert(selected);
        updateLineChart();
    });

    function updateBar(){
        d3.select('.year').text(year);

        contries_keys = d3.map(data, function (d) {
            return d['region'];
        }).keys();

        mean_value = [];
        max_value = 0
        for (let country of contries_keys){
            countryDat =  data.filter(function(d){return d.region==country})
            let countryRange = countryDat.map(d => +d[param][year]);

            mean = 0;
            count = 0;
             for (let value of countryRange) {
                  mean+=value; 
                  count+=1;
                }
            mean = mean/count;
            mean_value.push({"region":country, "mean":mean});

            // alert(country);
            // alert(mean);

            if (mean>max_value) {
                max_value = mean;
            }
        }

        xBar.domain(contries_keys);
        xBarAxis.call(d3.axisBottom(xBar));

        yBar.domain([0, max_value]).range([500, 0]);
        yBarAxis.call(d3.axisLeft(yBar));

        barChart.selectAll('rect').data(mean_value).enter().append('rect');

        barChart.selectAll('rect').data(mean_value)
            .attr('width', xBar.bandwidth())
            .attr('height', d => 500 - yBar(d['mean']))
            .attr('x', d => xBar(d['region']))
            .attr('y', d => yBar(d['mean']) - 30)
            .attr("fill", d => colorScale(d['region']));

        d3.selectAll('rect').on('click', function (actual, i) {
            d3.selectAll('rect').attr('opacity', 0.5);
            d3.select(this).attr('opacity', 1);
            selected_country = actual.region;
            alert(selected_country);
            updateScattePlot();
        });

         d3.selectAll('rect').on('click', function (actual, i) {
            updateScattePlot();
            if (highlighted != this) {
                d3.selectAll('rect').attr('opacity', 0.5);
                d3.select(this).attr('opacity', 1);
                console.log(actual.region);
                console.log(scatterPlot.selectAll('circle'));
                scatterPlot.selectAll('circle').filter(d => d['region'] != actual.region).attr('r', 0);
                highlighted = this;
    
            }else{
                d3.selectAll('rect').attr('r', 1);
                updateScattePlot();
                highlighted = null;
  
            }
           // updateScattePlot();

        });
        
        return;
    }

    updateBar();
    function updateScattePlot() {

        
        d3.select('.year').text(year);

        let xRange = data.map(d => +d[xParam][year]);
        x.domain([d3.min(xRange), d3.max(xRange)]);
        xAxis.call(d3.axisBottom(x));

        let yRange = data.map(d => +d[yParam][year]);
        y.domain([d3.min(yRange), d3.max(yRange)]);
        yAxis.call(d3.axisLeft(y));

        let rRange = data.map(d => +d[rParam][year]);
        radiusScale.domain([d3.min(rRange), d3.max(rRange)]);



        scatterPlot.selectAll('circle').data(data)
            .enter()
            .append('circle');

         

        scatterPlot.selectAll('circle').data(data)
            .attr("cx", d => x(d[xParam][year]))
            .attr("cy", d => y(d[yParam][year]))
            .attr("r", d => radiusScale(d[rParam][year]))
            .attr("fill", d => colorScale(d['region']))
            .attr('opacity', 0.7);

       
        scatterPlot.selectAll('circle').on('click', function (actual, i) {
            selected = actual['country'];
            d3.selectAll('circle').attr('stroke-width', 'default');
            this.parentNode.appendChild(this);
            d3.select(this).attr('stroke-width', 5);
            updateLineChart();
        });
        return;
    }
   updateScattePlot();

    function updateLineChart() {
        if (selected) {
          //  alert(lineParam);
            d3.select('.country-name').text(selected);
            let lineDat = data.filter(d => d['country'] == selected).map(d => d[lineParam])[0];
            // alert(lineDat);
            let lineDatVis = [];

            for (let line_detail of  Object.entries(lineDat)){
                // alert(line_detail);
                let obj = {"year": line_detail[0], "value": line_detail[1]};
                lineDatVis.push(obj);
            }

            lineDatVis.splice(221, 5);

            let xRange = d3.range(1800, 2021);
            x.domain([d3.min(xRange), d3.max(xRange)]);
            xLineAxis.call(d3.axisBottom(x));

            let yRange = d3.values(lineDat).map(d => +d);
            y.domain([d3.min(yRange), d3.max(yRange)]);
            yLineAxis.call(d3.axisLeft(y));

            lineChart.append('path').attr('class', 'line').datum(lineDatVis).enter().append('path');
            lineChart.selectAll('.line').datum(lineDatVis)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.7)
                .attr("d", d3.line()
                    .x(d => x(+d.year))
                    .y(d => y(+d.value))
                );

            return;
        }
    }

    updateLineChart();

});



async function loadData() {
    const data = { 
        'population': await d3.csv('data/population.csv'),
        'gdp': await d3.csv('data/gdp.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expectancy.csv'),
        'fertility-rate': await d3.csv('data/fertility-rate.csv')
    };
    
    return data.population.map(d=>{
        const index = data.gdp.findIndex(item => item.geo == d.geo);
        return  {
            country: d.country,
            geo: d.geo,
            region: d.region,
            population: d,
            'gdp': data['gdp'][index],
            'child-mortality': data['child-mortality'][index],
            'life-expectancy': data['life-expectancy'][index],
            'fertility-rate': data['fertility-rate'][index]
        }
    })
}

