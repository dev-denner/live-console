import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiError, invalidResponseError, normalizeApiError } from './api-error';

export type ResponseParser<T> = (payload: unknown) => T;

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, parse?: ResponseParser<T>): Observable<T> {
    return this.http.get<unknown>(url).pipe(
      map((payload) => {
        if (!parse) return payload as T;
        try {
          return parse(payload);
        } catch (error) {
          if (this.isApiError(error)) throw error;
          throw invalidResponseError(error instanceof Error ? error.message : undefined);
        }
      }),
      catchError((error: unknown) => throwError(() => this.isApiError(error) ? error : normalizeApiError(error)))
    );
  }

  post<T>(url: string, body: unknown, parse?: ResponseParser<T>): Observable<T> { return this.request('post', url, body, parse); }
  put<T>(url: string, body: unknown, parse?: ResponseParser<T>): Observable<T> { return this.request('put', url, body, parse); }
  delete<T>(url: string): Observable<T> { return this.http.delete<unknown>(url).pipe(map((payload) => payload as T), catchError((error: unknown) => throwError(() => this.isApiError(error) ? error : normalizeApiError(error)))); }

  private request<T>(method: 'post' | 'put', url: string, body: unknown, parse?: ResponseParser<T>): Observable<T> {
    return this.http.request<unknown>(method, url, { body }).pipe(map((payload) => parse ? parse(payload) : payload as T), catchError((error: unknown) => throwError(() => this.isApiError(error) ? error : normalizeApiError(error))));
  }

  private isApiError(error: unknown): error is ApiError {
    return typeof error === 'object'
      && error !== null
      && typeof (error as { code?: unknown }).code === 'string'
      && typeof (error as { message?: unknown }).message === 'string'
      && ('status' in error);
  }
}
