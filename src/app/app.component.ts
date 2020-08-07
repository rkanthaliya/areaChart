import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') public chartContainer: ElementRef;
  public margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
  public chart1: any;
  public width: number;
  public height: number;
  public xScale: any;
  public yScale: any;
  public colors: any;
  public xAxis: any;
  public yAxis: any;
  public data: any;
  public svg: any;
  public vertline: any;
  constructor() {}

  ngOnInit() {}
  ngAfterViewInit() {
    this.createChart();
  }

  public createChart() {
    const ele = this.chartContainer.nativeElement;
    //ele.addEventListener('mousemove', this.mouseMove);
    const data1 = [
      { year: 2000, desktops: 80 },
      { year: 2001, desktops: 130 },
      { year: 2002, desktops: 40 },
      { year: 2003, desktops: 70 },
      { year: 2004, desktops: 100 },
      { year: 2005, desktops: 90 },
    ];

    const data = [
      { year: 2000, desktops: 80, laptops: 210 },
      { year: 2001, desktops: 130, laptops: 50 },
      { year: 2002, desktops: 40, laptops: 70 },
      { year: 2003, desktops: 70, laptops: 180 },
      { year: 2004, desktops: 100, laptops: 50 },
      { year: 2005, desktops: 90, laptops: 190 },
    ];
    const keys1 = ['desktops', 'laptops'];
    const keys = ['desktops'];

    const width = 600;
    const height = 500;
    const spacing = 60;

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
      .range([0, width]);
    const yScale = d3.scaleLinear().range([height - spacing, 0]);
    this.chart1 = d3.select(ele).append('svg');
    this.svg = this.chart1
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + spacing / 2 + ',' + spacing / 2 + ')')
      .on('mousemove', this.mouseMove);
    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + (height - spacing) + ')')
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('d')));

    const stack = d3.stack().keys(keys1);
    const colors = ['dodgerblue', 'purple'];
    const stackedData = stack(data);
    console.log(stackedData);

    yScale.domain([
      0,
      d3.max(stackedData[stackedData.length - 1], (d) => d[1]),
    ]);
    this.svg.append('g').call(d3.axisLeft(yScale));

    const area = d3
      .area()
      .x((d: any) => xScale(d.data.year))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]));
    const series = this.svg
      .selectAll('g.series')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'series');
    series
      .append('path')
      .style('fill', (d, i) => colors[i])
      .attr('d', (d: any) => area(d));

    //vertical line
    this.vertline = this.svg
      .append('rect')
      .attr('x', 600)
      .attr('y', 0)
      .attr('width', 600)
      .attr('height', height - spacing)
      .attr('stroke', 'black')
      .attr('fill', '#69a3b2')
      .attr('opacity', 0.5);
  }

  public mouseMove = () => {
    const mouseX = d3.event.pageX;
    if (mouseX - 60 > 0 && mouseX < 601) {
      this.vertline.attr('x', mouseX - 60);
    } else {
      this.vertline.attr('x', 600);
    }
  };
}
