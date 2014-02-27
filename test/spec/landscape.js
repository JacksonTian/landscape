/*global expect, Scape*/
describe("LandScape", function() {
  describe("Scape", function() {
    it("ready should ok", function() {
      var app = new Scape();
      var a = 0;
      app.ready('key', function () {
        a++;
      });
      expect(a).toEqual(0);
      app.set('key', '');
      expect(a).toEqual(1);
    });

    it("onchange should ok", function() {
      var app = new Scape();
      var a = 0;
      app.onchange('key', 'value', function () {
        a++;
      });
      expect(a).toEqual(0);
      app.set('key', '-key');
      expect(a).toEqual(0);
      app.set('value', '-value');
      expect(a).toEqual(1);
      app.set('value', '-value2');
      expect(a).toEqual(2);
      app.set('key', '-key2');
      expect(a).toEqual(3);
    });

    it("onchange should ok2", function() {
      var app = new Scape();
      var a = 0;
      app.ready('key', function () {
        app.set('value', 'value');
      });
      app.onchange('key', 'value', function () {
        a++;
      });
      expect(a).toEqual(0);
      app.set('key', '-key');
      expect(a).toEqual(1);
      app.set('value', '-value');
      expect(a).toEqual(2);
      app.set('value', '-value2');
      expect(a).toEqual(3);
      app.set('key', '-key2');
      expect(a).toEqual(5);
    });
  });
});
