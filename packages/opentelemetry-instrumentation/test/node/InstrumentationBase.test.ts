/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import * as sinon from 'sinon';
import { InstrumentationBase, InstrumentationModuleDefinition } from '../../src';

const MODULE_NAME = 'test-module';
const MODULE_FILE_NAME = 'test-module-file';
const MODULE_VERSION = '0.1.0';
const WILDCARD_VERSION = '*';
const MODULE_DIR = '/random/dir';

class TestInstrumentation extends InstrumentationBase {
  constructor() {
    super(MODULE_NAME, MODULE_VERSION);
  }

  init() {}
}

describe('InstrumentationBase', () => {
  describe('_onRequire - module version is not available', () => {
    let instrumentation: TestInstrumentation;
    let modulePatchSpy: sinon.SinonSpy;
  
    beforeEach(() => {
      instrumentation = new TestInstrumentation();
      // @ts-expect-error access internal property for testing
      instrumentation._enabled = true;
      modulePatchSpy = sinon.spy();
    });
    
    describe('when patching a module', () => {
      it('should not patch module when there is no wildcard supported version', () => {
        const moduleExports = {};
        const instrumentationModule = {
          supportedVersions: [`^${MODULE_VERSION}`],
          name: MODULE_NAME,
          patch: modulePatchSpy as unknown,
        } as InstrumentationModuleDefinition<unknown>;

        // @ts-expect-error access internal property for testing
        instrumentation._onRequire<unknown>(
          instrumentationModule,
          moduleExports,
          MODULE_NAME,
          MODULE_DIR
        );
    
        assert.strictEqual(instrumentationModule.moduleVersion, undefined);
        assert.strictEqual(instrumentationModule.moduleExports, undefined);
        sinon.assert.notCalled(modulePatchSpy);
      });

      it('should patch module when there is a wildcard supported version', () => {
        const moduleExports = {};
        const instrumentationModule = {
          supportedVersions: [`^${MODULE_VERSION}`, WILDCARD_VERSION],
          name: MODULE_NAME,
          patch: modulePatchSpy as unknown,
        } as InstrumentationModuleDefinition<unknown>;

        // @ts-expect-error access internal property for testing
        instrumentation._onRequire<unknown>(
          instrumentationModule,
          moduleExports,
          MODULE_NAME,
          MODULE_DIR
        );
    
        assert.strictEqual(instrumentationModule.moduleVersion, undefined);
        assert.strictEqual(instrumentationModule.moduleExports, moduleExports);
        sinon.assert.calledOnceWithExactly(modulePatchSpy, moduleExports, undefined);
      });
    });

    describe('when patching module files', () => {
      let filePatchSpy: sinon.SinonSpy;

      beforeEach(() => {
        filePatchSpy = sinon.spy();
      })

      it('should not patch module file when there is no wildcard supported version', () => {
        const moduleExports = {};
        const supportedVersions = [`^${MODULE_VERSION}`];
        const instrumentationModule = {
          supportedVersions,
          name: MODULE_NAME,
          patch: modulePatchSpy as unknown,
          files: [{
            name: MODULE_FILE_NAME,
            supportedVersions,
            patch: filePatchSpy as unknown
          }]
        } as InstrumentationModuleDefinition<unknown>;

        // @ts-expect-error access internal property for testing
        instrumentation._onRequire<unknown>(
          instrumentationModule,
          moduleExports,
          MODULE_FILE_NAME,
          MODULE_DIR
        );
    
        assert.strictEqual(instrumentationModule.moduleVersion, undefined);
        assert.strictEqual(instrumentationModule.moduleExports, undefined);
        sinon.assert.notCalled(modulePatchSpy);
        sinon.assert.notCalled(filePatchSpy);
      });

      it('should patch module file when there is a wildcard supported version', () => {
        const moduleExports = {};
        const supportedVersions = [`^${MODULE_VERSION}`, WILDCARD_VERSION];
        const instrumentationModule = {
          supportedVersions,
          name: MODULE_NAME,
          patch: modulePatchSpy as unknown,
          files: [{
            name: MODULE_FILE_NAME,
            supportedVersions,
            patch: filePatchSpy as unknown
          }]
        } as InstrumentationModuleDefinition<unknown>;

        // @ts-expect-error access internal property for testing
        instrumentation._onRequire<unknown>(
          instrumentationModule,
          moduleExports,
          MODULE_FILE_NAME,
          MODULE_DIR
        );
    
        assert.strictEqual(instrumentationModule.moduleVersion, undefined);
        assert.strictEqual(instrumentationModule.files[0].moduleExports, moduleExports);
        sinon.assert.notCalled(modulePatchSpy);
        sinon.assert.calledOnceWithExactly(filePatchSpy, moduleExports, undefined);
      });
    });
  });
});
