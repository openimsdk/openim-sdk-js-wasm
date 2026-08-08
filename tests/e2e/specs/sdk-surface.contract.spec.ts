import { readFileSync } from 'fs';
import path from 'path';
import { expect, test } from '@playwright/test';
import ts from 'typescript';
import surface from '../contracts/sdk-surface.json';

const sdkRoot = path.resolve(process.cwd());
const sdkFile = path.join(sdkRoot, 'src/sdk/index.ts');

function publicOwnMethods(): string[] {
  const sourceText = readFileSync(sdkFile, 'utf8');
  const source = ts.createSourceFile(
    sdkFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  const methods: string[] = [];
  source.forEachChild(node => {
    if (!ts.isClassDeclaration(node) || node.name?.text !== 'WasmSdk') {
      return;
    }
    for (const member of node.members) {
      if (
        ts.isConstructorDeclaration(member) ||
        member.modifiers?.some(
          modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword
        )
      ) {
        continue;
      }
      const name = member.name;
      if (name && (ts.isIdentifier(name) || ts.isStringLiteral(name))) {
        methods.push(name.text);
      }
    }
  });
  return methods.sort();
}

test('public SDK surface matches the reviewed Core-aligned baseline', () => {
  expect(publicOwnMethods()).toEqual(surface.ownMethods);
});

test('legacy public type names remain available with deprecated markers', () => {
  const files = [
    'src/sdk/index.ts',
    'src/types/params.ts',
    'src/types/entity.ts',
    'src/types/enum.ts',
    'src/types/eventData.ts',
    'src/constant/index.ts',
  ];
  const deprecatedNames = new Set<string>();
  const compatibilityDeclarations: string[] = [];
  for (const filename of files) {
    const absolutePath = path.join(sdkRoot, filename);
    const sourceText = readFileSync(absolutePath, 'utf8');
    const source = ts.createSourceFile(
      absolutePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true
    );
    const compatibilityStart = sourceText.indexOf(
      'Compatibility names retained for applications upgrading from patch.10.'
    );
    source.forEachChild(node => {
      if (
        compatibilityStart >= 0 &&
        node.getStart(source) > compatibilityStart &&
        (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node))
      ) {
        compatibilityDeclarations.push(node.name.text);
      }
    });
    const visit = (node: ts.Node) => {
      if (ts.getJSDocDeprecatedTag(node)) {
        const named = node as ts.NamedDeclaration;
        if (
          named.name &&
          (ts.isIdentifier(named.name) || ts.isStringLiteral(named.name))
        ) {
          deprecatedNames.add(named.name.text);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  for (const compatibilityName of compatibilityDeclarations) {
    expect(deprecatedNames.has(compatibilityName), compatibilityName).toBe(
      true
    );
  }
  for (const legacyName of [
    'CbEvents',
    'WSEvent',
    'WsResponse',
    'MessageReceiveOptType',
    'GroupAtType',
    'ViewType',
    'InitAndLoginConfig',
    'GetInputstatesParams',
    'SearchedFriendsInfo',
    'FriendshipInfo',
    'AdvancedGetMessageResult',
    'PicBaseInfo',
    'AtUsersInfoItem',
    'EventDataMap',
    'DataOfEvent',
    'Succeed',
    'Agree',
    'Reject',
    'isBlack',
    'isFriend',
    'Logout',
    'Logging',
    'Logged',
    'UnRead',
    'OnRecvOnlineOnlyMessages',
    'info',
    'displayIsRead',
  ]) {
    expect(deprecatedNames.has(legacyName), legacyName).toBe(true);
  }
});

test('Core names replace removed compatibility methods', () => {
  const methods = new Set(surface.ownMethods);
  for (const canonical of [
    'getInputStates',
    'hideConversation',
    'hideAllConversations',
    'searchConversation',
  ]) {
    expect(methods.has(canonical), canonical).toBe(true);
  }
  for (const removed of [
    'getInputstates',
    'deleteConversation',
    'deleteAllConversationFromLocal',
    'SetSelfInfoEx',
    'typingStatusUpdate',
    'pinConversation',
    'setConversationRecvMessageOpt',
    'markMessagesAsReadByMsgID',
  ]) {
    expect(methods.has(removed), removed).toBe(false);
  }
});
