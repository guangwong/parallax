KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('parallax', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','gallery/parallax/1.0/']});