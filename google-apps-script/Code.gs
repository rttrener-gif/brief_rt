/**
 * Google Apps Script — Web App для записи данных из HTML-страницы в Google Sheets.
 *
 * Установка:
 * 1. Откройте Google-таблицу → Расширения → Apps Script
 * 2. Вставьте этот код в Code.gs
 * 3. Развернуть → Новое развёртывание → Веб-приложение
 * 4. Выполнять от: Меня, Доступ: Все
 * 5. Скопируйте URL и вставьте в APPS_SCRIPT_URL в index.html
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('data');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('data');
    }

    var data = e.postData.contents;

    // Записываем JSON в ячейку A1
    sheet.getRange('A1').setValue(data);

    // Записываем метку времени последнего обновления в B1
    sheet.getRange('B1').setValue(new Date().toISOString());

    // Записываем имя автора (если передан) в C1
    var parsed = JSON.parse(data);
    if (parsed.author) {
      sheet.getRange('C1').setValue(parsed.author);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('data');
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'empty' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getRange('A1').getValue();
  return ContentService
    .createTextOutput(data || '{}')
    .setMimeType(ContentService.MimeType.JSON);
}
