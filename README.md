# Jest-puppeteer-utils

## Гайд по jest+puppeteer+jest-puppeteer. Кровь и пот

### Docs:

```js
import {
  go,
  typeInto,
  clickElement,
  search,
  waitForNetworkAction,
  hoverElement,
  getInnerText,
} from 'jest-puppeteer-utils';
```

#### `go(url)`

```js
go(
  url: string
): page: object
```

Creates new page, disables cache, then navigates to provied url

Example:

```js
const page = await go('SOME_URL');
```

#### `getInnerText(elem)`

```js
getInnerText(
  element: object
): string
```

Extracts text from element

Example:

```js
const renderedItemInnerText = await getInnerText(renderedItem);
```

#### `waitForNetworkAction(page, url, method)`

```js
waitForNetworkAction(
  page: object,
  url: string,
  method: string
): { data: object, ok: string, response: Promise }
```

Waits for network action with matching string and method

Example:

```js
const { ok } = await waitForNetworkAction(page, 'SOME_API', 'DELETE');
```

#### `clickElement(selector, page)`

```js
clickElement(
  selector: string,
  page: object
): elem: object
```

Waits for provided element by selector then clicks on it

Example:

```js
await clickElement('#SOME_ELEMENT', page);
```

#### `hoverElement(selector, page)`

```js
hoverElement(
  selector: string,
  page: object
): elem: object
```

Waits for provided element by selector then hovers on it

Example:

```js
await hoverElement('#SOME_ELEMENT', page);
```

#### `typeInto(selector, text, page)`

```js
typeInto(
  selector: string,
  text: string,
  page: object
): elem: object
```

Waits for provided element by selector then types into that element. Deletes
present value if found

Example:

```js
await typeInto('#SOME_SHIT', 'SOME_TEXT_TO_TYPE', page);
```

#### `search(searchString, searchElement, url, page)`

```js
typeInto(
  searchString,
  searchElement,
  url,
  page
): respose: Promise
```

Types into provided element a string and waits for network

Example:

```js
await search('SOME_TEXT_TO_TYPE', '#SEARCH_INPUT', SOME_API, page);
```

### Проблемные кейсы

#### Кейс #1: Кэш

По-умолчанию кэш хранится между запусками в headless режиме - ты просто не
сможешь отловить реквесты/респонсы при повторном запуске теста. Спускай кэш при
создании страниц (этот уже включен в функцию `go` библиотеки):

```javascript
const page = await browser.newPage()
await page.setCacheEnabled(false) 👏
```

или в каждом тесте

```javascript
describe((‘test session for some page’, () => {
  beforeAll(async () => {
    browser = await puppeteer.launch(common.getDebugSettings());
    const context = await browser.createIncognitoBrowserContext();
    await context.newPage();
    await common.login();
  }

  beforeEach(async () => {
    await page.setCacheEnabled(false)
  }
}
```

#### Кейс #2: Отлов после перехода

Если есть желание отловить данные сразу после использования **goto**, используй
это:

```javascript
const [{ data, ok }] = await Promise.all([
  waitForNetworkAction(page, 'КУСОК_УРЛА'), // waitForNetworkAction функция библиотеки
  page.goto('УРЛ'),
]);
```

#### Кейс #3: Ждать div'чики

В доке предлагают селектить элемент так:

```javascript
const element = await page.$('#МОЙ_КРУТОЙ_СЕЛЕКТОР');
```

^^^ Этот код не всегда сможет поймать элемент. А этот сможет. Всегда:

```javascript
const renderedItemName = await page.waitForSelector('#МОЙ_КРУТОЙ_СЕЛЕКТОР', {
  timeout: 60000,
});
```

#### Кейс #4: Логин

Авторизацию лучше делать в отдельной странице, в beforeEach вне тестов

(в глобале -> `setupFilesAfterEnv: [... , '<rootDir>/jest/jest.globals.js']`):

```javascript
export const login = async () => {
  ///// какой-то код логина
};

beforeEach(async () => {
  await login();
});

// после можно подождать и закрыть браузер
afterEach(async () => {
  await page.waitFor(global.isDebugging() ? 3000 : 0);
  await browser.close();
});
```
