// SPDX-FileCopyrightText: 2021 Open Energy Solutions Inc
//
// SPDX-License-Identifier: Apache-2.0

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-grafana-dialog',
  templateUrl: './grafana-dialog.component.html',
  styleUrls: ['./grafana-dialog.component.scss']
})
export class GrafanaDialogComponent implements OnInit {
  safeUrl: SafeResourceUrl;
  title: string = 'Grafana chart';
  deviceMrid: string = '';
  variablePath: string = '';
  from: string = 'now-15m';
  to: string = 'now';
  query: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<GrafanaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.title = this.data?.title ? this.data.title : this.title;
    this.deviceMrid = this.data?.deviceMrid ? this.data.deviceMrid : '';
    this.variablePath = this.data?.variablePath ? this.data.variablePath : '';
    
    this.query = this.buildSqlFromHmiData();
    
    this.refreshIframe();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  applyQuery(): void {
    this.refreshIframe();
  }

  resetQuery(): void {
    this.query = this.buildSqlFromHmiData();
    this.from = 'now-15m';
    this.to = 'now';
    this.refreshIframe();
  }

  private refreshIframe(): void {
    // const sql = this.normalizeSql(this.query);
    // this.query = sql;

    const params = new URLSearchParams();
    
    params.set('orgId', '1');
    params.set('panelId', '1');
    params.set('theme', 'light');
    
    params.set('from', this.from || 'now-15m');
    params.set('to', this.to || 'now');
    
    params.set('var-sql', this.query);

    const grafanaBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    const grafanaUrl = `${grafanaBaseUrl}/d-solo/hmi-measure-variable/measure-box-variable?${params.toString()}`;
    // console.log('URL completa:', grafanaUrl);
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(grafanaUrl);

  }

  // private defaultQuery(deviceMrid: string): string {
  //   const safeMrid = deviceMrid || '00000000-0000-0000-0000-000000000000';
  //   return `select "timestamp", phv_phsc_mag as "Active", ppv_phsab_mag as "Reactive", ppv_phsbc_mag as "Aparent" from data where device_uuid = '${safeMrid}' AND $__timeFilter("timestamp") ORDER BY "timestamp" ASC`;
  // }

  // private defaultQuery(deviceMrid: string): string {
  //   // const id = deviceMrid || '00000000-0000-0000-0000-000000000001';
  //   const id = deviceMrid || '00000000-0000-0000-0000-000000000000';
  //   return `SELECT "timestamp" AS "time", a_phsb_mag AS "Avg Current" FROM data WHERE device_uuid = '${id}' ORDER BY "timestamp" ASC`;
  // }

  private buildSqlFromHmiData(): string {
    const mrid = this.deviceMrid || '00000000-0000-0000-0000-000000000000';
    const dbColumn = this.mapOpenFmbToPostgres(this.variablePath);
    const alias = this.title; 
    const limit = 200;

  
    return `SELECT * FROM (SELECT "timestamp" AS "time", ${dbColumn} AS "${alias}" FROM data WHERE device_uuid = '${mrid}' ORDER BY "timestamp" DESC LIMIT ${limit}) AS subquery ORDER BY "time" ASC`;
  } 

  private mapOpenFmbToPostgres(path: string): string {
    if (!path) return 'a_phsb_mag'; // Fallback por seguridad

    // Dividimos el path por puntos
    const parts = path.split('.');
    const mmxuIndex = parts.indexOf('readingMMXU');
    
    if (mmxuIndex !== -1 && parts.length > mmxuIndex + 2) {
      const type = parts[mmxuIndex + 1].toLowerCase();   
      const phase = parts[mmxuIndex + 2].toLowerCase();  
      const mag = parts[parts.length - 1].toLowerCase(); 
      return `${type}_${phase}_${mag}`; // Resultado: ppv_phsab_mag
    }

    return parts[parts.length - 1] === 'mag' ? 'a_phsb_mag' : parts[parts.length - 1];
  }

  // private normalizeSql(sql: string): string {
  //   if (!sql) {
  //     return this.defaultQuery(this.deviceMrid);
  //   }
  //   return sql
  //     .replace(/\r?\n+/g, ' ')
  //     .replace(/\s+/g, ' ')
  //     .trim()
  //     .replace(/;+\s*$/, '');
  // }
}
