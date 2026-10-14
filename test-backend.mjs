import { assessProjectAgainstCode, parseProjectDescription } from './src/services/assessmentEngine.js';
import { askCodeAssistant } from './src/services/aiProvider.js';
import { CODE_PROVISIONS, OCCUPANCY_CLASSIFICATIONS, SOURCE_DOCUMENTS, OFFICIAL_METADATA } from './src/data/codeKnowledgeBase.js';

console.log('--- Testing Data ---');
console.log('Provisions count:', CODE_PROVISIONS.length);
console.log('Occupancy groups count:', OCCUPANCY_CLASSIFICATIONS.length);
console.log('Documents count:', SOURCE_DOCUMENTS.length);

console.log('--- Testing Assessment Engine ---');
const parsed = parseProjectDescription("مبنى تجاري مكون من بدروم وأرضي وخمسة أدوار متكررة، مساحة الدور ١٢٠٠ م²، ارتفاع المبنى ٢٤ م، والبدروم مخصص لانتظار السيارات.");
console.log('Parsed:', parsed);
const assessed = assessProjectAgainstCode(parsed);
console.log('Assessed items count:', assessed.findings.length);

console.log('--- Testing AI Assistant ---');
const aiResp = await askCodeAssistant("ما هي مسافة الارتحال؟");
console.log('AI response citation:', aiResp.citation);

console.log('ALL TESTS PASSED!');
