import { dummyData } from './data';
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
  public timeFormat(formats: any) {
    return function (date) {
      let i = formats.length - 1,
        f = formats[i];
      while (!f[1](date)) {
        f = formats[--i];
      }
      return f[0](date);
    };
  }

  public createChart() {
    const ele = this.chartContainer.nativeElement;

    const data = dummyData;

    const ticksCount = () => {
      return 6;
    };

    const dynamicDateFormat = this.timeFormat([
      [
        d3.timeFormat('%Y'),
        function () {
          return true;
        },
      ], // <-- how to display when Jan 1 YYYY
      [
        d3.timeFormat('%b %Y'),
        function (d) {
          return d.getMonth();
        },
      ],
      [
        d3.timeFormat('%d %b'),
        function (d) {
          return d.getDate() !== 1;
        },
      ],
    ]);

    const convertedData = Object.keys(data[0])
      .slice(1)
      .map((id) => ({
        id,
        values: data.map((d) => ({ date: new Date(d.year), value: d[id] })),
      }));

    const width = 600;
    const height = 500;
    const spacing = 60;

    const xScale = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return new Date(d.year);
        })
      )
      .range([0, width - spacing]);

    const yScale = d3.scaleLinear().range([height - spacing, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(['laptops', 'desktops'])
      .range(['rgba(249, 208, 87, 0.7)', 'rgba(54, 174, 175, 0.65)']);

    const newcolor = d3
      .scaleOrdinal()
      .domain(['laptops', 'desktops'])
      .range(['red', 'rgba(54, 174, 175)']);

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
      d3.min(convertedData, (data) => d3.min(data.values, (d) => d.value)),
      d3.max(convertedData, (data) => d3.max(data.values, (d) => d.value)),
    ]);

    color.domain(convertedData.map((c) => c.id));

    newcolor.domain(convertedData.map((c) => c.id));

    this.svg
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + yScale(0) + ')')
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(dynamicDateFormat))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0));

    this.svg
      .append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke-opacity', 0));

    this.svg
      .append('linearGradient')
      .attr('id', 'temperature-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', yScale(1))
      .attr('x2', 0)
      .attr('y2', yScale(2))
      .selectAll('stop')
      .data([
        { offset: 0, color: 'steelblue' },
        { offset: 1, color: 'rgba(249, 208, 87, 0.7)' },
      ])
      .enter()
      .append('stop')
      .attr('offset', function (d) {
        return d.offset;
      })
      .attr('stop-color', function (d) {
        return d.color;
      });
    this.svg
      .append('linearGradient')
      .attr('id', 'temperature-gradient1')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', yScale(50))
      .attr('x2', 0)
      .attr('y2', yScale(60))
      .selectAll('stop')
      .data([{ offset: '0', color: 'rgba(54, 174, 175, 0.65)' }])
      .enter()
      .append('stop')
      .attr('offset', function (d) {
        return d.offset;
      })
      .attr('stop-color', function (d) {
        return d.color;
      });
    const area = d3
      .area()
      .x((d: any) => {
        const key = xScale(new Date(d.date));
        this.dataPoints[key] = this.dataPoints[key] || [];
        this.dataPoints[key].push(d);
        return xScale(new Date(d.date));
      })
      .y0(yScale(1))
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
      .style('fill', (d) => {
        const id =
          d.id === 'laptops'
            ? '#temperature-gradient'
            : '#temperature-gradient1';
        return `url(${id})`;
      })
      .style('stroke', 'white')
      .style('stroke-width', '2')
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

    // vertical line
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
    // verticle circle
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
    console.log(mouseY);
    if (mouseX > 540 || mouseY > 460) {
      this.verticleRect.attr('x', 600).attr('width', 0);
      this.vertLine.attr('x1', 600).attr('x2', 600);
      this.vertCircle.attr(
        'transform',
        'translate(' + 600 + ',' + +this.yScalePos + ')'
      );
    }
  };
}
