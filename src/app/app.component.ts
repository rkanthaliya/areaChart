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
  public verticleRect: any;
  public vertLine: any;
  public vertCircle: any;
  public yScalePos: number;
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
      { year: 2004, desktops: 10, laptops: 50 },
      { year: 2005, desktops: 90, laptops: 190 },
      { year: 2006, desktops: 80, laptops: 210 },
      { year: 2007, desktops: 130, laptops: 50 },
      { year: 2008, desktops: 40, laptops: 70 },
      { year: 2009, desktops: 70, laptops: 180 },
      { year: 2010, desktops: 10, laptops: 50 },
      { year: 2011, desktops: 90, laptops: 190 },
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
      .range([0, width - spacing]);

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
      .on('mousemove', this.mouseMove)
      .on('mouseout', this.mouseOut)
      .append('g')
      .attr('transform', 'translate(' + spacing / 2 + ',' + spacing / 2 + ')');

    yScale.domain([
      -10,
      d3.max(convertedData, (data) => d3.max(data.values, (d) => d.value)),
    ]);

    color.domain(convertedData.map((c) => c.id));

    this.svg
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + yScale(0) + ')')
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('d')))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0));

    this.svg
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0));

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

    this.verticleRect = this.svg
      .append('rect')
      .attr('x', 600)
      .attr('y', 0)
      .attr('width', 540)
      .attr('height', height)
      .attr('fill', '#fff')
      .attr('opacity', 0.5);

    //vertical line
    this.vertLine = this.svg
      .append('line')
      .attr('class', 'vertLine')
      .attr('x1', 600)
      .attr('x2', 600)
      .attr('y1', yScale(0))
      .attr('y2', yScale(210))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    this.yScalePos = yScale(210) - 10;
    //verticle circle
    this.vertCircle = this.svg
      .append('circle')
      .attr('class', 'vertCircle')
      .attr('r', 5)
      .attr('transform', 'translate(600,' + (yScale(210) - 10) + ')')
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
  }

  public mouseMove = () => {
    const keys = Object.keys(this.dataPoints).sort(function (a, b) {
      return +a - +b;
    });
    const epsilon = (+keys[1] - +keys[0]) / 2;
    const mouseX = d3.event.pageX;
    const nearest = keys.find((a: any) => {
      return Math.abs(a - mouseX + 60) <= epsilon;
    });
    console.log(nearest);
    if (nearest) {
      this.verticleRect.attr('x', nearest).attr('width', 540 - +nearest);
      this.vertLine.attr('x1', nearest).attr('x2', nearest);
      this.vertCircle.attr(
        'transform',
        'translate(' + nearest + ',' + +this.yScalePos + ')'
      );
    }
  };
  public mouseOut = () => {
    const mouseX = d3.event.pageX;
    const mouseY = d3.event.pageY;
    if (mouseX > 540 || mouseY > 500) {
      console.log('hide');
      this.verticleRect.attr('x', 600).attr('width', 0);
      this.vertLine.attr('x1', 600).attr('x2', 600);
      this.vertCircle.attr(
        'transform',
        'translate(' + 600 + ',' + +this.yScalePos + ')'
      );
    }
  };
}
