import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/push.js' );

	[ true, false ].forEach( modifyArrays => {
		test( `ractive.push() (modifyArrays: ${modifyArrays})`, t => {
			let items = [ 'alice', 'bob', 'charles' ];

			const ractive = new Ractive({
				el: fixture,
				template: `
				<ul>
				{{#items}}
				<li>{{this}}</li>
				{{/items}}
				</ul>`,
				data: { items }
			});

			ractive.push( 'items', 'dave' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
		});
	});

	test( 'Array method proxies return a promise that resolves on transition complete', t => {
		t.expect( 2 );

		const done = t.async();

		let items = [ 'alice', 'bob', 'charles' ];
		let transitioned;

		const ractive = new Ractive({
			el: fixture,
			template: `
			<ul>
			{{#items}}
			<li intro='test'>{{this}}</li>
			{{/items}}
			</ul>`,
			data: { items },
			transitions: {
				test ( t ) {
					transitioned = true;
					t.complete();
				}
			}
		});

		ractive.push( 'items', 'dave' ).then( () => {
			t.ok( transitioned );
			t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
			done();
		});
	});

	test( 'grow an array if pushing to an undefined keypath', t => {
		const done = t.async();

		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}{{.}}{{/each}}`,
		});

		const result = r.push( 'items', 1 );
		t.htmlEqual( fixture.innerHTML, '1' );

		result.then( res => t.equal( res, 1 ) ).then( done, done );
	});

	test( 'Interpolators that directly reference arrays are updated on array mutation (#1074)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{letters}}',
			data: {
				letters: [ 'a', 'b', 'c' ]
			}
		});

		ractive.push( 'letters', 'd', 'e', 'f' );
		t.htmlEqual( fixture.innerHTML, 'a,b,c,d,e,f' );
	});
}
