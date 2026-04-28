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
  from: string = 'now-6h';
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
    this.query = this.data?.query ? this.data.query : this.defaultQuery(this.deviceMrid);
    this.refreshIframe();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  applyQuery(): void {
    this.refreshIframe();
  }

  resetQuery(): void {
    this.query = this.defaultQuery(this.deviceMrid);
    this.from = 'now-6h';
    this.to = 'now';
    this.refreshIframe();
  }

  private refreshIframe(): void {
    const sql = this.normalizeSql(this.query);
    this.query = sql;

    const params = new URLSearchParams();
    params.set('orgId', '1');
    params.set('panelId', '1');
    params.set('theme', 'light');
    params.set('from', this.from || 'now-6h');
    params.set('to', this.to || 'now');
    params.set('var-sql', sql);

    const grafanaBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    const grafanaUrl = `${grafanaBaseUrl}/d-solo/hmi-measure-variable/measure-box-variable?${params.toString()}`;
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(grafanaUrl);
  }

  private defaultQuery(deviceMrid: string): string {
    const safeMrid = deviceMrid || '00000000-0000-0000-0000-000000000000';
    return `select "timestamp", phv_phsc_mag as "Active", ppv_phsab_mag as "Reactive", ppv_phsbc_mag as "Aparent" from data where device_uuid = '${safeMrid}' AND $__timeFilter("timestamp") ORDER BY "timestamp" ASC`;
  }

  private normalizeSql(sql: string): string {
    if (!sql) {
      return this.defaultQuery(this.deviceMrid);
    }
    return sql
      .replace(/\r?\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/;+\s*$/, '');
  }
}
