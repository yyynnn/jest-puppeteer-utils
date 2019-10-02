const createNativeFn = (fn) => async (element) =>
  element.executionContext().evaluate(fn, element);

export const getInnerText = createNativeFn(
  (nativeElement) => nativeElement.innerText,
);

/**
 * waits for network action with matching string and method
 *
 * @param {*} page puppeteer page entity
 * @param {string} [url='']
 * @param {string} [method=''] HTTP method
 * @returns
 */
export const waitForNetworkAction = async (page, url = '', method = '') => {
  const response = await page.waitForResponse((res) => {
    return (
      res.url().includes(url) &&
      res
        .request()
        .method()
        .includes(method)
    );
  });
  const data = await (method === 'DELETE' || method === 'POST'
    ? {}
    : response.json());
  const ok = await response.ok();

  return { data, ok, response };
};

/**
 * Waits for provided element by selector then clicks on it
 *
 * @param {string} selector
 * @param {object} page puppeteer page entity
 * @returns {object} element
 */
export const clickElement = async (selector, page) => {
  const elem = await page.waitForSelector(selector, { timeout: 60000 });
  await elem.click();
  return elem;
};

/**
 * Waits for provided element by selector then hovers on it
 *
 * @param {string} selector
 * @param {object} page puppeteer page entity
 * @returns {object} element
 */
export const hoverElement = async (selector, page) => {
  const elem = await page.waitForSelector(selector, { timeout: 60000 });
  await elem.hover();
  return elem;
};
/**
 * Waits for provided element by selector then types into that element
 *
 * @param {string} selector
 * @param {*} text text to input
 * @param {object} page puppeteer page entity
 * @returns {object} element
 */
export const typeInto = async (selector, text, page) => {
  const elem = await page.waitForSelector(selector, { timeout: 60000 });
  await page.click(selector, { clickCount: 2 });
  await elem.type(text);
  return elem;
};

/**
 * Creates new page, disables cache, then navigates to provied url
 *
 * @param {string} url
 * @returns {object} page
 */
export const go = async (url) => {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.goto(url);
  return page;
};

/**
 *
 *
 * @param {string} searchString
 * @param {object} searchElement
 * @param {string} url
 * @param {object} page
 * @returns {Promise} promise
 */
export const search = async (searchString, searchElement, url, page) => {
  await typeInto(searchElement, searchString, page);
  const { response } = await waitForNetworkAction(page, url, 'GET');
  return { searchResponse: response };
};

export const jestPuppeteerUtils = {
  go,
  typeInto,
  clickElement,
  search,
  waitForNetworkAction,
  hoverElement,
};
