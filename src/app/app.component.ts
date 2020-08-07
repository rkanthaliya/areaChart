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
  public dataPoints = {};
  constructor() {}

  ngOnInit() {}
  ngAfterViewInit() {
    this.createChart();
  }

  public createChart() {
    const ele = this.chartContainer.nativeElement;

    const data = [
      { year: 2000, desktops: 80, laptops: 210 },
      { year: 2001, desktops: 130, laptops: 50 },
      { year: 2002, desktops: 40, laptops: 70 },
      { year: 2003, desktops: 70, laptops: 180 },
      { year: 2004, desktops: -10, laptops: 50 },
      { year: 2005, desktops: 90, laptops: 190 },
    ];

    const convertedData = Object.keys(data[0])
      .slice(1)
      .map((id) => ({
        id,
        values: data.map((d) => ({ date: d.year, value: d[id] })),
      }));

    const width = 600;
    const height = 500;
    const spacing = 60;

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
      .range([0, width]);

    const yScale = d3.scaleLinear().range([height - spacing, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(['laptops', 'desktops'])
      .range(['rgba(249, 208, 87, 0.7)', 'rgba(54, 174, 175, 0.65)']);

    this.svg = d3
      .select(ele)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + spacing / 2 + ',' + spacing / 2 + ')')
      .on('mousemove', this.mouseMove);

    yScale.domain([
      -10,
      d3.max(convertedData, (data) => d3.max(data.values, (d) => d.value)),
    ]);

    color.domain(convertedData.map((c) => c.id));

    this.svg
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + yScale(0) + ')')
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('d')));

    this.svg
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale));

    const area = d3
      .area()
      .x((d: any) => {
        const key = xScale(d.date);
        this.dataPoints[key] = this.dataPoints[key] || [];
        this.dataPoints[key].push(d);
        return xScale(d.date);
      })
      .y0(yScale(0))
      .y1((d: any) => {
        return yScale(d.value);
      });

    const series = this.svg
      .selectAll('.area')
      .data(convertedData)
      .enter()
      .append('g')
      .attr('class', (d) => `area ${d.id}`);

    series
      .append('path')
      .style('fill', (d) => color(d.id))
      .attr('d', (d: any, i: number) => {
        return area(d.values);
      });

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
    const keys = Object.keys(this.dataPoints);
    const epsilon = (+keys[1] - +keys[0]) / 2;
    const mouseX = d3.event.pageX;
    const nearest = keys.find((a: any) => {
      return Math.abs(a - mouseX) <= epsilon;
    });
    if (nearest) {
      this.vertline.attr('x', nearest);
    } else {
      this.vertline.attr('x', 600);
    }
  };
}
